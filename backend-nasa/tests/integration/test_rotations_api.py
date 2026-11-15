from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.data.processed import ProcessedRepository, clear_cache
from app.features.rotations.router import get_configs_dir, get_models_dir, get_repository
from app.main import create_app
from tests.rotation_fixtures import write_all

pytestmark = pytest.mark.anyio


@pytest.fixture
async def api(tmp_path: Path) -> AsyncIterator[AsyncClient]:
    clear_cache()
    app = create_app()
    repo = ProcessedRepository(write_all(tmp_path))
    models_dir = tmp_path / "models"
    configs_dir = tmp_path / "configs"
    app.dependency_overrides[get_repository] = lambda: repo
    app.dependency_overrides[get_models_dir] = lambda: models_dir
    app.dependency_overrides[get_configs_dir] = lambda: configs_dir
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


async def test_sites_lists_processed_sites(api: AsyncClient) -> None:
    r = await api.get("/api/v1/rotations/sites")
    body = r.json()
    assert r.status_code == 200 and body["success"]
    keys = [s["key"] for s in body["data"]]
    assert keys == ["nevada_mason_valley", "banyumas"]
    assert "alfalfa" in body["data"][0]["crops"]
    assert body["data"][0]["crop_labels"]["chili"] == "Chili pepper"


async def test_compare_returns_ranked_strategies_with_cards_and_approaches(
    api: AsyncClient,
) -> None:
    r = await api.post("/api/v1/rotations/compare", json={"site": "nevada_mason_valley"})
    data = r.json()["data"]
    assert r.status_code == 200
    assert len(data["strategies"]) == 3
    assert [s["rank"] for s in data["strategies"]] == [1, 2, 3]
    card = data["strategies"][0]["card"]
    assert {"why", "evidence", "benefits", "gaps", "risks_for_local_review"} <= set(card)
    approaches = data["strategies"][0]["approaches"]
    assert [a["approach"] for a in approaches] == [
        "water_balance",
        "ml_stress_baseline",
        "observational_matching",
    ]
    assert data["model_info"]["model_id"] == "stress_baseline_v1"
    assert data["model_info"]["r2_score"] > 0.5
    assert data["disclaimer"]


async def test_train_and_list_models_endpoints(api: AsyncClient, tmp_path: Path) -> None:
    r_train = await api.post(
        "/api/v1/rotations/train",
        json={"ridge_alpha": 0.1, "stress_threshold_mm": 210.0},
    )
    assert r_train.status_code == 200
    train_data = r_train.json()["data"]
    assert train_data["registry_updated"] is True
    assert train_data["model"]["model_id"] == "stress_baseline_v1"
    assert train_data["model"]["n_samples"] > 0
    assert (tmp_path / "models" / "stress_baseline_v1.json").is_file()
    assert (tmp_path / "models" / "registry.yaml").is_file()
    assert (tmp_path / "configs" / "stress_baseline_v1.yaml").is_file()

    r_models = await api.get("/api/v1/rotations/models")
    assert r_models.status_code == 200
    models_list = r_models.json()["data"]
    assert len(models_list) == 1
    assert models_list[0]["model_id"] == "stress_baseline_v1"


async def test_compare_with_farmer_baseline(api: AsyncClient) -> None:
    payload = {
        "site": "banyumas",
        "priorities": {"water": 1, "soil_health": 0, "erosion": 0, "pest_break": 0},
        "risk_aversion": 1,
        "enso_phase": "la_nina",
        "baseline": [{"MT1_wet": "rice", "MT2_wet_dry": "rice", "MT3_dry": "rice"}],
    }
    r = await api.post("/api/v1/rotations/compare", json=payload)
    data = r.json()["data"]
    assert r.status_code == 200
    assert data["analogs"]["phase"].startswith("la_nina")
    assert "farmer_baseline" in [s["key"] for s in data["strategies"]]


@pytest.mark.parametrize(
    ("payload", "status", "code"),
    [
        (
            {"site": "nevada_mason_valley", "baseline": [{"winter_recharge": "corn"}]},
            400,
            "bad_request",
        ),
        ({"site": "mars"}, 404, "not_found"),
        ({"site": "banyumas", "risk_aversion": 2}, 422, "validation_error"),
        (
            {
                "site": "banyumas",
                "priorities": {"water": 0, "soil_health": 0, "erosion": 0, "pest_break": 0},
            },
            400,
            "bad_request",
        ),
        ({"site": "Bad Site!"}, 422, "validation_error"),
    ],
)
async def test_compare_errors(
    api: AsyncClient, payload: dict[str, object], status: int, code: str
) -> None:
    r = await api.post("/api/v1/rotations/compare", json=payload)
    assert r.status_code == status
    assert r.json()["error"]["code"] == code


async def test_default_repository_uses_settings(tmp_path: Path) -> None:
    repo = get_repository()
    assert repo.base.name == "processed"


async def test_compare_with_field_and_scenario(tmp_path: Path) -> None:
    from tests.rotation_fixtures import write_fields

    clear_cache()
    base = write_all(tmp_path)
    write_fields(base)
    app = create_app()
    app.dependency_overrides[get_repository] = lambda: ProcessedRepository(base)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        payload = {
            "site": "banyumas",
            "field_id": "banyumas-karangrau-01",
            "scenario": {"rain_anomaly_pct": -20, "temp_delta_c": 1.5},
        }
        r = await c.post("/api/v1/rotations/compare", json=payload)
        data = r.json()["data"]
        assert r.status_code == 200
        assert data["field_ctx"]["slope_pct"] == 3.0
        assert data["scenario"]["temp_delta_c"] == 1.5
        r = await c.post("/api/v1/rotations/compare", json={"site": "banyumas", "field_id": "nope"})
        assert r.status_code == 404
        bad = {"site": "banyumas", "scenario": {"rain_anomaly_pct": -90}}
        r = await c.post("/api/v1/rotations/compare", json=bad)
        assert r.status_code == 422
    app.dependency_overrides.clear()


async def test_field_without_soil_values_is_rejected(tmp_path: Path) -> None:
    from tests.rotation_fixtures import field_profile, write_fields

    clear_cache()
    base = write_all(tmp_path)
    broken = field_profile()
    broken["soil"] = {}
    write_fields(base, content=[broken])
    app = create_app()
    app.dependency_overrides[get_repository] = lambda: ProcessedRepository(base)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post(
            "/api/v1/rotations/compare",
            json={"site": "banyumas", "field_id": "banyumas-karangrau-01"},
        )
        assert r.status_code == 400 and "slope or AWC" in r.json()["error"]["message"]
    app.dependency_overrides.clear()
