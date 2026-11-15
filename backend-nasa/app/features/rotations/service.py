"""Glue between the API schemas, the processed-data repository, the rotation engine, and PostGIS."""

from __future__ import annotations

import contextlib
import datetime as dt
import logging
import math
from dataclasses import asdict, replace
from decimal import Decimal
from pathlib import Path
from typing import Any, cast

from geoalchemy2.elements import WKBElement, WKTElement
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rotation.catalog import CROPS, SITES, TEMPLATES, build_years
from app.ai.rotation.engine import compare
from app.ai.rotation.models import (
    Comparison,
    FieldContext,
    Scenario,
    SiteData,
    StrategyResult,
    StrategyTemplate,
)
from app.ai.rotation.stress_model import (
    TrainedStressModel,
    evaluate_strategy_approaches,
    load_or_train_model,
    save_trained_model,
    train_stress_model,
)
from app.core.errors import DomainError, NotFoundError
from app.data.processed import ProcessedRepository
from app.db.models import (
    ApproachType,
    ClimateYearLabel,
    ConfidenceLevel,
    Crop,
    DataGap,
    EvidenceCard,
    ModelVersion,
    ObjectiveType,
    Parcel,
    ParcelKind,
    ParcelSoilProperty,
    Region,
    ScenarioOutcome,
    Strategy,
    StrategyItem,
    StrategyOrigin,
)
from app.features.rotations.schemas import (
    CompareRequest,
    ComparisonOut,
    ComparisonSummaryOut,
    ParetoStatus,
    PersistenceOut,
    ScoreBreakdown100Out,
    SiteInfo,
    StrategyScores100Out,
    TrainedModelInfoOut,
    TrainModelRequest,
    TrainModelResponseOut,
)

logger = logging.getLogger(__name__)


def list_sites(repo: ProcessedRepository) -> list[SiteInfo]:
    out = []
    for key in repo.available_sites():
        data = repo.load(key)
        out.append(
            SiteInfo(
                key=key,
                name=SITES[key].name,
                seasons=dict(SITES[key].seasons),
                crops=sorted(CROPS),
                crop_labels={k: c.name for k, c in sorted(CROPS.items())},
                latest_enso_phase=data.latest_enso,
                latest_iod_phase=data.latest_iod,
                sources=list(data.sources),
            )
        )
    return out


def _relative_100(value: float, values: list[float]) -> int:
    lo = min(values)
    hi = max(values)
    if math.isclose(hi, lo):
        return 100
    return round(100.0 * (hi - value) / (hi - lo))


def _compute_scores_100(result: Comparison) -> dict[str, StrategyScores100Out]:
    means = [s.metrics.irrigation_mean_mm for s in result.strategies]
    worsts = [s.metrics.irrigation_cvar_mm for s in result.strategies]
    w = result.weights
    w_sum = sum(w.values()) or 1.0
    out: dict[str, StrategyScores100Out] = {}
    for s in result.strategies:
        soil_100 = round(s.metrics.soil_health * 100)
        cover_100 = round(s.metrics.cover_share * 100)
        erosion_100 = round(s.utilities["erosion"] * 100)
        pest_100 = round(s.metrics.pest_break_share * 100)

        mean_water = _relative_100(s.metrics.irrigation_mean_mm, means)
        worst_water = _relative_100(s.metrics.irrigation_cvar_mm, worsts)

        mean_overall = round(
            (
                w["water"] * mean_water
                + w["soil_health"] * soil_100
                + w["erosion"] * erosion_100
                + w["pest_break"] * pest_100
            )
            / w_sum
        )
        worst_overall = round(
            (
                w["water"] * worst_water
                + w["soil_health"] * soil_100
                + w["erosion"] * erosion_100
                + w["pest_break"] * pest_100
            )
            / w_sum
        )
        out[s.key] = StrategyScores100Out(
            mean=ScoreBreakdown100Out(
                water_efficiency=mean_water,
                soil_health=soil_100,
                cover_days=cover_100,
                erosion_control=erosion_100,
                pest_break=pest_100,
                overall=mean_overall,
            ),
            worst_case=ScoreBreakdown100Out(
                water_efficiency=worst_water,
                soil_health=soil_100,
                cover_days=cover_100,
                erosion_control=erosion_100,
                pest_break=pest_100,
                overall=worst_overall,
            ),
        )
    return out


def _pareto_status(s: StrategyResult) -> ParetoStatus:
    if not s.pareto_optimal:
        return "Dominated"
    return "Optimal" if s.rank == 1 else "Tradeoff"


def _to_model_info_out(model: TrainedStressModel) -> TrainedModelInfoOut:
    return TrainedModelInfoOut(
        model_id=model.model_id,
        version=model.version,
        approach=model.approach,
        trained_at=model.trained_at,
        n_samples=model.n_samples,
        r2_score=model.r2_score,
        rmse_mm=model.rmse_mm,
        mae_mm=model.mae_mm,
        stress_accuracy=model.stress_accuracy,
        feature_weights=dict(model.feature_weights),
    )


def _build_comparison_out(
    result: Comparison,
    site_data: SiteData,
    templates: list[StrategyTemplate],
    trained_model: TrainedStressModel,
    *,
    compact: bool = False,
    persistence: PersistenceOut | None = None,
) -> ComparisonOut:
    raw = asdict(result)
    scores_map = _compute_scores_100(result)
    tpl_by_key = {t.key: t for t in templates}

    gap_sets = [set(s.card.gaps) for s in result.strategies]
    shared_gaps = sorted(set.intersection(*gap_sets)) if gap_sets else []

    for strat_dict, strat_obj in zip(raw["strategies"], result.strategies, strict=True):
        strat_dict["pareto_status"] = _pareto_status(strat_obj)
        strat_dict["scores_100"] = scores_map[strat_obj.key].model_dump()
        tpl = tpl_by_key.get(strat_obj.key)
        if tpl is not None:
            approaches = evaluate_strategy_approaches(
                tpl,
                site_data,
                result.analogs,
                result.field_ctx,
                result.scenario,
                strat_obj.metrics,
                trained_model,
            )
            strat_dict["approaches"] = [asdict(a) for a in approaches]
        else:
            strat_dict["approaches"] = []
        if compact and shared_gaps:
            strat_dict["card"]["gaps"] = [
                g for g in strat_dict["card"]["gaps"] if g not in shared_gaps
            ]

    top = result.strategies[0]
    baseline = next((s for s in result.strategies if s.kind == "baseline"), result.strategies[-1])
    conf_val: Any = (
        top.card.confidence if top.card.confidence in ("low", "medium", "high") else "low"
    )
    summary = ComparisonSummaryOut(
        recommended_strategy_key=top.key,
        recommended_strategy_name=top.name,
        pareto_optimal_count=sum(1 for s in result.strategies if s.pareto_optimal),
        analog_years_count=len(result.analogs.years),
        water_saved_vs_baseline_mm=round(
            baseline.metrics.irrigation_mean_mm - top.metrics.irrigation_mean_mm, 1
        ),
        cvar_water_saved_mm=round(
            baseline.metrics.irrigation_cvar_mm - top.metrics.irrigation_cvar_mm, 1
        ),
        overall_confidence=conf_val,
    )
    raw["summary"] = summary.model_dump()
    raw["model_info"] = _to_model_info_out(trained_model).model_dump()
    raw["shared_site_gaps"] = shared_gaps
    raw["persistence"] = (
        persistence.model_dump()
        if persistence is not None
        else PersistenceOut(
            pushed=False,
            status="skipped_no_db",
            records_synced=0,
            persisted_at=None,
            detail="Evaluated in memory without an active database session.",
        ).model_dump()
    )
    return ComparisonOut.model_validate(raw)


def _evaluate_request(
    req: CompareRequest,
    repo: ProcessedRepository,
    models_dir: Path | None = None,
) -> tuple[
    Comparison,
    SiteData,
    list[StrategyTemplate],
    TrainedStressModel,
    dict[str, Any] | None,
]:
    site = repo.load(req.site)
    templates = list(TEMPLATES[req.site])
    if req.baseline is not None:
        try:
            years = build_years(SITES[req.site], req.baseline)
        except ValueError as exc:
            raise DomainError(str(exc)) from exc
        templates[0] = replace(
            templates[0],
            key="farmer_baseline",
            name="Current rotation (entered by the farmer)",
            years=years,
            rationale="The rotation the farmer reports using now.",
            evidence_basis="farmer",
            gaps=("Rotation entered by the farmer; not checked against satellite data.",),
        )
    field_ctx, field_profile = (
        _field_context_with_profile(repo, req.site, req.field_id) if req.field_id else (None, None)
    )
    scenario = Scenario(req.scenario.rain_anomaly_pct, req.scenario.temp_delta_c)
    try:
        result = compare(
            site,
            templates,
            weights=req.priorities.model_dump(),
            risk_aversion=req.risk_aversion,
            enso=req.enso_phase,
            iod=req.iod_phase,
            field=field_ctx,
            scenario=scenario,
        )
    except ValueError as exc:
        raise DomainError(str(exc)) from exc

    all_sites = [repo.load(k) for k in repo.available_sites()] or [site]
    trained_model = load_or_train_model(all_sites, models_dir=models_dir)
    return result, site, templates, trained_model, field_profile


def run_comparison(
    req: CompareRequest,
    repo: ProcessedRepository,
    models_dir: Path | None = None,
) -> ComparisonOut:
    result, site_data, templates, trained_model, _ = _evaluate_request(req, repo, models_dir)
    return _build_comparison_out(result, site_data, templates, trained_model, compact=req.compact)


async def run_comparison_and_persist(
    req: CompareRequest,
    repo: ProcessedRepository,
    session: AsyncSession | None = None,
    models_dir: Path | None = None,
) -> ComparisonOut:
    """Evaluate AI rotation strategies (3 approaches) and push results to PostgreSQL/PostGIS."""
    result, site_data, templates, trained_model, field_profile = _evaluate_request(
        req, repo, models_dir
    )
    persistence = await push_comparison_to_db(
        session, result, site_data, field_profile, trained_model=trained_model
    )
    return _build_comparison_out(
        result,
        site_data,
        templates,
        trained_model,
        compact=req.compact,
        persistence=persistence,
    )


def list_registered_models(
    repo: ProcessedRepository,
    models_dir: Path | None = None,
) -> list[TrainedModelInfoOut]:
    """Return active AI/ML models and their cross-validated evaluation metrics."""
    sites_data = [repo.load(k) for k in repo.available_sites()]
    if not sites_data:
        return []
    stress_model = load_or_train_model(sites_data, models_dir=models_dir)
    return [_to_model_info_out(stress_model)]


async def train_and_persist_model(
    req: TrainModelRequest,
    repo: ProcessedRepository,
    models_dir: Path,
    configs_dir: Path | None = None,
    session: AsyncSession | None = None,
) -> TrainModelResponseOut:
    """Train `stress_baseline_v1` on harmonized NASA data, save artifact, and sync to PostGIS."""
    sites_data = [repo.load(k) for k in repo.available_sites()]
    if not sites_data:
        raise DomainError("No harmonized sites available to train AI model.")

    model = train_stress_model(
        sites_data,
        ridge_alpha=req.ridge_alpha,
        stress_threshold_mm=req.stress_threshold_mm,
    )
    artifact_path = save_trained_model(model, models_dir, configs_dir)
    persistence = await _push_model_version_to_db(session, model)

    try:
        rel_path = str(artifact_path.relative_to(models_dir.parent))
    except ValueError:
        rel_path = str(artifact_path)

    return TrainModelResponseOut(
        model=_to_model_info_out(model),
        artifact_path=rel_path.replace("\\", "/"),
        registry_updated=True,
        persistence=persistence,
    )


async def _push_model_version_to_db(
    session: AsyncSession | None,
    model: TrainedStressModel,
) -> PersistenceOut:
    if session is None:
        return PersistenceOut(
            pushed=False,
            status="skipped_no_db",
            records_synced=0,
            persisted_at=None,
            detail="DATABASE_URL not active; trained AI model saved to local models/ directory.",
        )

    try:
        mv = (
            await session.execute(
                select(ModelVersion).where(
                    ModelVersion.name == model.model_id,
                    ModelVersion.version == model.version,
                )
            )
        ).scalar_one_or_none()
        metrics_payload: dict[str, Any] = {
            "r2_score": model.r2_score,
            "rmse_mm": model.rmse_mm,
            "mae_mm": model.mae_mm,
            "stress_accuracy": model.stress_accuracy,
            "n_samples": model.n_samples,
            "ridge_alpha": model.ridge_alpha,
            "feature_weights": model.feature_weights,
        }
        if mv is None:
            mv = ModelVersion(
                name=model.model_id,
                version=model.version,
                approach=ApproachType.ML_STRESS_BASELINE,
                artifact_path=f"models/{model.model_id}.json",
                metrics=metrics_payload,
                is_active=True,
            )
            session.add(mv)
        else:
            mv.metrics = metrics_payload
            mv.is_active = True

        await session.commit()
        return PersistenceOut(
            pushed=True,
            status="persisted",
            records_synced=1,
            persisted_at=dt.datetime.now(dt.UTC).isoformat(),
            detail=f"Synced trained AI model '{model.model_id}' v{model.version} to PostGIS.",
        )
    except (SQLAlchemyError, OSError, TimeoutError, ValueError) as exc:
        logger.warning("Failed to push trained model to database: %s", exc)
        with contextlib.suppress(Exception):
            await session.rollback()
        return PersistenceOut(
            pushed=False,
            status="db_error_fallback",
            records_synced=0,
            persisted_at=None,
            detail="Database unreachable; trained AI artifact saved to disk.",
        )


def _field_context(repo: ProcessedRepository, site: str, field_id: str) -> FieldContext:
    ctx, _ = _field_context_with_profile(repo, site, field_id)
    return ctx


def _field_context_with_profile(
    repo: ProcessedRepository, site: str, field_id: str
) -> tuple[FieldContext, dict[str, Any]]:
    for f in repo.load_fields(site):
        if f.get("id") == field_id:
            soil = f.get("soil") or {}
            try:
                return FieldContext(field_id, float(soil["slope"]), float(soil["awc"])), f
            except (KeyError, TypeError, ValueError) as exc:
                raise DomainError(f"Field '{field_id}' lacks slope or AWC.") from exc
    raise NotFoundError(f"Field '{field_id}' not found for site '{site}'.")


def _make_multipolygon_wkt(lat: float, lng: float, delta: float = 0.002) -> WKBElement:
    wkt = (
        f"MULTIPOLYGON((({lng - delta:.6f} {lat - delta:.6f}, "
        f"{lng + delta:.6f} {lat - delta:.6f}, "
        f"{lng + delta:.6f} {lat + delta:.6f}, "
        f"{lng - delta:.6f} {lat + delta:.6f}, "
        f"{lng - delta:.6f} {lat - delta:.6f})))"
    )
    return cast(WKBElement, WKTElement(wkt, srid=4326))


def _make_point_wkt(lat: float, lng: float) -> WKBElement:
    return cast(WKBElement, WKTElement(f"POINT({lng:.6f} {lat:.6f})", srid=4326))


def _resolve_crop_code(label: str) -> str:
    lower = label.lower()
    if lower == "fallow":
        return "fallow"
    for code, profile in CROPS.items():
        if lower.startswith(profile.name.lower()) or code == lower:
            return code
    return "fallow"


async def push_comparison_to_db(
    session: AsyncSession | None,
    comparison: Comparison,
    site_data: SiteData,
    field_profile: dict[str, Any] | None = None,
    *,
    trained_model: TrainedStressModel | None = None,
) -> PersistenceOut:
    """Persist AI rotation comparison output into PostgreSQL/PostGIS tables."""
    if session is None:
        return PersistenceOut(
            pushed=False,
            status="skipped_no_db",
            records_synced=0,
            persisted_at=None,
            detail="DATABASE_URL not active; comparison served from harmonized dataset cache.",
        )

    try:
        code = site_data.config.key
        region = (
            await session.execute(select(Region).where(Region.code == code))
        ).scalar_one_or_none()
        is_us = code == "nevada_mason_valley"
        if region is None:
            region = Region(
                code=code,
                name=site_data.config.name,
                country_code="US" if is_us else "ID",
                has_field_data=is_us,
                has_rotation_history=site_data.rotation_evidence is not None,
            )
            session.add(region)
            await session.flush()

        ext_id = (
            comparison.field_ctx.field_id
            if comparison.field_ctx is not None
            else f"{comparison.site}-default-parcel"
        )
        parcel = (
            await session.execute(
                select(Parcel).where(Parcel.region_id == region.id, Parcel.external_id == ext_id)
            )
        ).scalar_one_or_none()

        coords = (
            field_profile.get("coordinates", [-7.5186, 109.2942])
            if field_profile
            else ([-7.5186, 109.2942] if comparison.site == "banyumas" else [38.985, -119.162])
        )
        lat, lng = float(coords[0]), float(coords[1])
        soil = (field_profile.get("soil") or {}) if field_profile else {}
        slope_val = (
            comparison.field_ctx.slope_pct
            if comparison.field_ctx is not None
            else float(soil.get("slope", 2.5))
        )
        erosion_risk = str(soil.get("erosionRisk", "Low")).lower()
        if erosion_risk == "moderate":
            erosion_risk = "medium"

        if parcel is None:
            parcel = Parcel(
                region_id=region.id,
                kind=ParcelKind.FIELD_PARCEL if comparison.field_ctx else ParcelKind.VILLAGE,
                external_id=ext_id,
                name=str(field_profile.get("name", ext_id)) if field_profile else ext_id,
                boundary=_make_multipolygon_wkt(lat, lng),
                centroid=_make_point_wkt(lat, lng),
                area_hectares=(
                    Decimal(str(field_profile.get("areaHectares", 2.4)))
                    if field_profile
                    else Decimal("2.40")
                ),
                slope_mean_deg=Decimal(str(round(slope_val, 2))),
                erosion_risk=erosion_risk,
            )
            session.add(parcel)
            await session.flush()

        existing_soil = (
            await session.execute(
                select(ParcelSoilProperty).where(ParcelSoilProperty.parcel_id == parcel.id)
            )
        ).scalar_one_or_none()
        if existing_soil is None:
            awc_val = (
                comparison.field_ctx.awc_mm_per_m
                if comparison.field_ctx is not None
                else float(soil.get("awc", 140.0))
            )
            session.add(
                ParcelSoilProperty(
                    parcel_id=parcel.id,
                    texture_class=str(soil.get("texture", "Clay Loam")),
                    awc_mm=Decimal(str(round(awc_val, 2))),
                    erosion_class=erosion_risk,
                    source="SSURGO" if is_us else "SoilGrids 250m",
                    resolution_m=30 if is_us else 250,
                )
            )
            await session.flush()

        # Ensure crops exist
        crops_by_code = {c.code: c for c in (await session.execute(select(Crop))).scalars().all()}
        for key, profile in CROPS.items():
            if key not in crops_by_code:
                crop_row = Crop(
                    code=key,
                    name=profile.name,
                    family=profile.family,
                    is_legume=profile.legume,
                    growth_duration_days=int(profile.default_months * 30),
                )
                session.add(crop_row)
                crops_by_code[key] = crop_row
        if "fallow" not in crops_by_code:
            fallow_row = Crop(
                code="fallow",
                name="Fallow (Bera)",
                name_id="Lahan Bera",
                family="fallow",
                is_legume=False,
                growth_duration_days=0,
            )
            session.add(fallow_row)
            crops_by_code["fallow"] = fallow_row
        await session.flush()

        # Ensure Water Balance & ML Stress Baseline ModelVersions exist
        mv = (
            await session.execute(
                select(ModelVersion).where(
                    ModelVersion.name == "fieldshift-rotation-engine",
                    ModelVersion.version == "0.1.0",
                )
            )
        ).scalar_one_or_none()
        if mv is None:
            mv = ModelVersion(
                name="fieldshift-rotation-engine",
                version="0.1.0",
                approach=ApproachType.WATER_BALANCE,
                metrics={"cvar_alpha": 0.2, "pe_factor": 0.8},
                is_active=True,
            )
            session.add(mv)
            await session.flush()

        ml_mv: ModelVersion | None = None
        if trained_model is not None:
            ml_mv = (
                await session.execute(
                    select(ModelVersion).where(
                        ModelVersion.name == trained_model.model_id,
                        ModelVersion.version == trained_model.version,
                    )
                )
            ).scalar_one_or_none()
            if ml_mv is None:
                ml_mv = ModelVersion(
                    name=trained_model.model_id,
                    version=trained_model.version,
                    approach=ApproachType.ML_STRESS_BASELINE,
                    artifact_path=f"models/{trained_model.model_id}.json",
                    metrics={
                        "r2_score": trained_model.r2_score,
                        "rmse_mm": trained_model.rmse_mm,
                        "stress_accuracy": trained_model.stress_accuracy,
                    },
                    is_active=True,
                )
                session.add(ml_mv)
                await session.flush()

        records_synced = 0
        by_year = {r.planning_year: r for r in site_data.records}
        for yr in comparison.analogs.years:
            rec = by_year.get(yr)
            if rec is None:
                continue
            lbl = (
                await session.execute(
                    select(ClimateYearLabel).where(
                        ClimateYearLabel.region_id == region.id,
                        ClimateYearLabel.year == yr,
                    )
                )
            ).scalar_one_or_none()
            if lbl is None:
                session.add(
                    ClimateYearLabel(
                        region_id=region.id,
                        year=yr,
                        enso_phase=rec.enso_phase,
                        iod_phase=rec.iod_phase,
                    )
                )
                records_synced += 1

        target_year = max(comparison.analogs.years) if comparison.analogs.years else 2024
        conf_map = {
            "high": ConfidenceLevel.HIGH,
            "medium": ConfidenceLevel.MEDIUM,
            "low": ConfidenceLevel.LOW,
        }

        for strat in comparison.strategies:
            strategy = (
                await session.execute(
                    select(Strategy).where(
                        Strategy.parcel_id == parcel.id, Strategy.name == strat.name
                    )
                )
            ).scalar_one_or_none()
            origin = (
                StrategyOrigin.CURRENT_ROTATION
                if strat.kind == "baseline"
                else StrategyOrigin.EXTENSION_SUGGESTED
            )
            if strategy is None:
                strategy = Strategy(
                    parcel_id=parcel.id,
                    name=strat.name,
                    is_baseline=strat.kind == "baseline",
                    origin=origin,
                )
                session.add(strategy)
                await session.flush()
                records_synced += 1

                order_idx = 1
                for year_dict in strat.sequence:
                    for season_label, crop_desc in year_dict.items():
                        crop_code = _resolve_crop_code(crop_desc)
                        crop_obj = crops_by_code.get(crop_code) or crops_by_code["fallow"]
                        session.add(
                            StrategyItem(
                                strategy_id=strategy.id,
                                crop_id=crop_obj.id,
                                sequence_order=order_idx,
                                season_label=season_label,
                            )
                        )
                        order_idx += 1
                        records_synced += 1

            card_row = (
                await session.execute(
                    select(EvidenceCard).where(EvidenceCard.strategy_id == strategy.id)
                )
            ).scalar_one_or_none()
            conf_enum = conf_map.get(strat.card.confidence, ConfidenceLevel.LOW)
            provenance_payload = {
                "sources": list(site_data.sources),
                "analog_grouping": comparison.analogs.grouping,
                "analog_phase": comparison.analogs.phase,
                "analog_years": list(comparison.analogs.years),
                "score": strat.score,
                "rank": strat.rank,
                "pareto_optimal": strat.pareto_optimal,
            }
            if card_row is None:
                session.add(
                    EvidenceCard(
                        strategy_id=strategy.id,
                        reason=strat.card.why,
                        evidence={"items": list(strat.card.evidence)},
                        benefits={"items": list(strat.card.benefits)},
                        gaps={"items": list(strat.card.gaps)},
                        risks_to_check={"items": list(strat.card.risks_for_local_review)},
                        confidence=conf_enum,
                        confidence_reasons={"items": list(strat.card.confidence_reasons)},
                        provenance=provenance_payload,
                        generated_by="rules",
                    )
                )
            else:
                card_row.reason = strat.card.why
                card_row.evidence = {"items": list(strat.card.evidence)}
                card_row.benefits = {"items": list(strat.card.benefits)}
                card_row.gaps = {"items": list(strat.card.gaps)}
                card_row.risks_to_check = {"items": list(strat.card.risks_for_local_review)}
                card_row.confidence = conf_enum
                card_row.confidence_reasons = {"items": list(strat.card.confidence_reasons)}
                card_row.provenance = provenance_payload
            records_synced += 1

            wb_stress_days = round(min(180.0, strat.metrics.irrigation_mean_mm / 14.5), 1)
            for obj_type, val in (
                (ObjectiveType.IRRIGATION_WATER_DEMAND, strat.metrics.irrigation_mean_mm),
                (ObjectiveType.WATER_STRESS_DAYS, wb_stress_days),
                (ObjectiveType.SOIL_HEALTH_ESTIMATE, strat.metrics.soil_health),
                (ObjectiveType.BARE_SOIL_DAYS, round((1.0 - strat.metrics.cover_share) * 365.0, 1)),
            ):
                existing_out = (
                    await session.execute(
                        select(ScenarioOutcome).where(
                            ScenarioOutcome.strategy_id == strategy.id,
                            ScenarioOutcome.year == target_year,
                            ScenarioOutcome.objective == obj_type,
                            ScenarioOutcome.approach == ApproachType.WATER_BALANCE,
                        )
                    )
                ).scalar_one_or_none()
                if existing_out is None:
                    session.add(
                        ScenarioOutcome(
                            strategy_id=strategy.id,
                            year=target_year,
                            objective=obj_type,
                            value=Decimal(str(round(val, 4))),
                            approach=ApproachType.WATER_BALANCE,
                            model_version_id=mv.id,
                        )
                    )
                else:
                    existing_out.value = Decimal(str(round(val, 4)))
                records_synced += 1

            if strat.card.gaps:
                existing_gap = (
                    (
                        await session.execute(
                            select(DataGap).where(
                                DataGap.parcel_id == parcel.id,
                                DataGap.strategy_id == strategy.id,
                            )
                        )
                    )
                    .scalars()
                    .first()
                )
                if existing_gap is None:
                    session.add(
                        DataGap(
                            parcel_id=parcel.id,
                            strategy_id=strategy.id,
                            variable="rotation_evidence_gap",
                            reason=strat.card.gaps[0],
                        )
                    )
                    records_synced += 1

        await session.commit()
        return PersistenceOut(
            pushed=True,
            status="persisted",
            records_synced=records_synced,
            persisted_at=dt.datetime.now(dt.UTC).isoformat(),
            detail=f"Synced {records_synced} AI comparison records to PostgreSQL/PostGIS.",
        )
    except (SQLAlchemyError, OSError, TimeoutError, ValueError) as exc:
        logger.warning("Failed to push AI comparison to database (fallback active): %s", exc)
        with contextlib.suppress(Exception):
            await session.rollback()
        return PersistenceOut(
            pushed=False,
            status="db_error_fallback",
            records_synced=0,
            persisted_at=None,
            detail="Database unreachable during request; AI comparison returned without DB write.",
        )
