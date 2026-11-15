"""Request and response schemas for /api/v1/rotations."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EnsoPhase = Literal["el_nino", "la_nina", "neutral"]
IodPhase = Literal["positive", "negative", "neutral"]


class Priorities(BaseModel):
    model_config = ConfigDict(extra="forbid")

    water: float = Field(default=1.0, ge=0, le=1, description="Weight for low irrigation need")
    soil_health: float = Field(default=1.0, ge=0, le=1)
    erosion: float = Field(default=1.0, ge=0, le=1, description="Weight for low erosion exposure")
    pest_break: float = Field(default=0.5, ge=0, le=1)


class CompareRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    site: str = Field(pattern=r"^[a-z0-9_]{1,40}$", examples=["nevada_mason_valley"])
    priorities: Priorities = Field(default_factory=Priorities)
    risk_aversion: float = Field(
        default=0.5, ge=0, le=1, description="0 = average years only, 1 = worst 20 % only"
    )
    enso_phase: EnsoPhase | None = Field(default=None, description="Default: latest observed")
    iod_phase: IodPhase | None = Field(default=None, description="Default: latest observed")
    baseline: list[dict[str, str]] | None = Field(
        default=None,
        min_length=1,
        max_length=10,
        description="Farmer's current rotation: one {season: crop} object per year; "
        "seasons left out are fallow. Replaces the default baseline.",
    )


class SiteInfo(BaseModel):
    key: str
    name: str
    seasons: dict[str, int]
    crops: list[str]
    latest_enso_phase: str
    latest_iod_phase: str
    sources: list[str]


class AnalogsOut(BaseModel):
    grouping: str
    phase: str
    years: list[int]


class MetricsOut(BaseModel):
    irrigation_mean_mm: float
    irrigation_cvar_mm: float
    cover_share: float
    legume_share: float
    families: int
    pest_break_share: float
    erosion_index: float
    soil_health: float


class EvidenceCardOut(BaseModel):
    why: str
    evidence: list[str]
    benefits: list[str]
    gaps: list[str]
    risks_for_local_review: list[str]
    confidence: Literal["low", "medium", "high"]
    confidence_reasons: list[str]


class StrategyOut(BaseModel):
    key: str
    name: str
    kind: Literal["baseline", "alternative"]
    sequence: list[dict[str, str]]
    metrics: MetricsOut
    utilities: dict[str, float]
    score: float
    rank: int
    pareto_optimal: bool
    card: EvidenceCardOut


class ComparisonOut(BaseModel):
    site: str
    analogs: AnalogsOut
    weights: dict[str, float]
    risk_aversion: float
    strategies: list[StrategyOut]
    disclaimer: str
