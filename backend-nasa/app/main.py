"""FastAPI application factory."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_v1
from app.core.config import Settings, get_settings
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging
from app.core.rate_limit import RateLimitMiddleware
from app.db.config import get_database_config
from app.db.connection import create_database_engine
from app.db.health import is_database_healthy
from app.db.session import create_session_factory
from app.features.health.router import router as health_router

logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level, settings.log_format)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        if settings.database_url is None:
            logger.warning("DATABASE_URL is not configured; skipping database initialization")
            yield
            return

        config = get_database_config(settings)
        engine = create_database_engine(config)
        session_factory = create_session_factory(engine)
        app.state.db_engine = engine
        app.state.db_session_factory = session_factory

        try:
            connected = await is_database_healthy(engine)
            if connected:
                logger.info("database connection check succeeded")
            else:
                logger.warning("database is unreachable; continuing application startup")
            yield
        finally:
            await engine.dispose()

    app = FastAPI(
        title="Field Shift API",
        description="Crop-rotation decision support API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    app.add_middleware(RateLimitMiddleware, limit=settings.rate_limit_default)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    register_error_handlers(app)
    app.include_router(health_router)
    app.include_router(api_v1)
    return app


app = create_app()
