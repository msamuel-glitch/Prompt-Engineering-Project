"""FastAPI application: entry point of the study-sheet API."""

import logging
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.config import get_settings
from app.sheets import router as sheets_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s:     %(name)s - %(message)s")

app = FastAPI(title="Study sheet API", version="0.1.0")
app.include_router(sheets_router)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    generator: str = Field(
        description='How sheets are made: "claude", "fixture" or "fake"'
    )
    has_api_key: bool = Field(
        description="Whether an Anthropic API key is configured (never the key "
        "itself). Without one, the interface offers the free copy-paste mode."
    )


# Routes live under /api so that the frontend dev server can forward them.
@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Tell clients that the API is running, and how it makes sheets.

    The interface shows the generator so a student knows whether to expect a
    real summary, a recorded one or a placeholder before uploading anything.
    """
    settings = get_settings()
    return HealthResponse(
        status="ok", generator=settings.generator, has_api_key=settings.has_api_key
    )
