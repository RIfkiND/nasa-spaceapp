"""Versioned API router. Feature routers are included here as they are built."""

from __future__ import annotations

from fastapi import APIRouter

from app.features.rotations.router import router as rotations_router

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(rotations_router)
