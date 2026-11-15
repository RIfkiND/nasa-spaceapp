"""Rotation comparison endpoints with AI engine evaluation, ML training, and DB persistence."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.db.session import get_optional_db_session
from app.features.rotations import service
from app.features.rotations.schemas import (
    CompareRequest,
    ComparisonOut,
    SiteInfo,
    TrainedModelInfoOut,
    TrainModelRequest,
    TrainModelResponseOut,
)

router = APIRouter(prefix="/rotations", tags=["rotations"])


def get_repository() -> ProcessedRepository:
    settings = get_settings()
    return ProcessedRepository(settings.resolve(settings.processed_dir))


def get_models_dir() -> Path:
    settings = get_settings()
    return settings.resolve(Path("models"))


def get_configs_dir() -> Path:
    settings = get_settings()
    return settings.resolve(Path("configs"))


@router.get(
    "/sites",
    response_model=ApiResponse[list[SiteInfo]],
    summary="List harmonized study sites and available crops",
    description=(
        "Returns all study sites (`banyumas`, `nevada_mason_valley`) that have harmonized "
        "NASA climate and terrain datasets ready in `PROCESSED_DIR`, including season slots, "
        "crop catalog keys, latest observed ENSO/IOD phases, and provenance sources."
    ),
    response_description="List of harmonized study sites wrapped in ApiResponse",
)
def sites(repo: ProcessedRepository = Depends(get_repository)) -> ApiResponse[list[SiteInfo]]:
    return ok(service.list_sites(repo))


@router.get(
    "/models",
    response_model=ApiResponse[list[TrainedModelInfoOut]],
    summary="List active AI/ML water-stress models and cross-validation metrics",
    description=(
        "Returns the active trained AI water-stress baseline model (`stress_baseline_v1`) "
        "along with 5-fold cross-validation metrics (`r2_score`, `rmse_mm`, `mae_mm`, "
        "`stress_accuracy`) and learned Ridge regression feature weights."
    ),
    response_description="Active trained AI models and evaluation metrics",
)
def list_models(
    repo: ProcessedRepository = Depends(get_repository),
    models_dir: Path = Depends(get_models_dir),
) -> ApiResponse[list[TrainedModelInfoOut]]:
    return ok(service.list_registered_models(repo, models_dir=models_dir))


@router.post(
    "/train",
    response_model=ApiResponse[TrainModelResponseOut],
    summary="Train or retrain the AI water-stress baseline model (`stress_baseline_v1`)",
    description=(
        "Trains the Ridge-regularized ML water-stress baseline model (`stress_baseline_v1`) "
        "on harmonized NASA POWER, GPM IMERG, NOAA ONI/DMI, and SoilGrids/SSURGO seasonal "
        "water-deficit samples across all study sites. Writes the trained artifact to "
        "`models/stress_baseline_v1.json`, updates `models/registry.yaml` and "
        "`configs/stress_baseline_v1.yaml`, and upserts the `ModelVersion` into PostGIS."
    ),
    response_description="Trained AI model metrics, artifact path, and PostGIS persistence status",
)
async def train_model(
    req: TrainModelRequest | None = None,
    repo: ProcessedRepository = Depends(get_repository),
    models_dir: Path = Depends(get_models_dir),
    configs_dir: Path = Depends(get_configs_dir),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[TrainModelResponseOut]:
    payload = req or TrainModelRequest()
    return ok(
        await service.train_and_persist_model(
            payload, repo, models_dir, configs_dir=configs_dir, session=db
        )
    )


@router.post(
    "/compare",
    response_model=ApiResponse[ComparisonOut],
    summary="Compare crop rotation strategies (3 AI approaches) and persist to PostGIS",
    description=(
        "Evaluates at least three crop rotation strategies (including the baseline rotation) "
        "against historical climate analog years matching the requested ENSO/IOD phase. "
        "Computes mean and worst-20% (CVaR20) irrigation demand, soil health heuristics, "
        "RUSLE slope-adjusted erosion exposure, Pareto dominance, normalized 0-100 scores, "
        "and a 3-approach comparison (`water_balance`, `ml_stress_baseline`, "
        "`observational_matching`). Whenever a PostgreSQL/PostGIS database session is "
        "configured, the AI comparison output is automatically upserted into the database."
    ),
    response_description="Ranked crop rotation strategies, executive summary, and DB sync status",
    responses={
        400: {"description": "Invalid domain parameters (e.g., all zero weights or invalid crop)"},
        404: {"description": "Requested site or field_id was not found"},
        422: {"description": "Validation error or missing processed dataset files"},
    },
)
async def compare_rotations(
    req: CompareRequest,
    repo: ProcessedRepository = Depends(get_repository),
    models_dir: Path = Depends(get_models_dir),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[ComparisonOut]:
    return ok(await service.run_comparison_and_persist(req, repo, db, models_dir=models_dir))
