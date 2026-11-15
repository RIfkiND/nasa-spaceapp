"""Rotation comparison endpoints. Sync handlers: file reads run in FastAPI's threadpool."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.features.rotations import service
from app.features.rotations.schemas import CompareRequest, ComparisonOut, SiteInfo

router = APIRouter(prefix="/rotations", tags=["rotations"])


def get_repository() -> ProcessedRepository:
    settings = get_settings()
    return ProcessedRepository(settings.resolve(settings.processed_dir))


@router.get("/sites", response_model=ApiResponse[list[SiteInfo]])
def sites(repo: ProcessedRepository = Depends(get_repository)) -> ApiResponse[list[SiteInfo]]:
    return ok(service.list_sites(repo))


@router.post("/compare", response_model=ApiResponse[ComparisonOut])
def compare_rotations(
    req: CompareRequest, repo: ProcessedRepository = Depends(get_repository)
) -> ApiResponse[ComparisonOut]:
    return ok(service.run_comparison(req, repo))
