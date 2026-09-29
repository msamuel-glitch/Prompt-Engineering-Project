"""FastAPI application: entry point of the study-sheet API."""

import logging
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from app.sheets import router as sheets_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s:     %(name)s - %(message)s")

app = FastAPI(title="Study sheet API", version="0.1.0")
app.include_router(sheets_router)


class HealthResponse(BaseModel):
    status: Literal["ok"]


# Routes live under /api so that the frontend dev server can forward them.
@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Tell clients that the API is running."""
    return HealthResponse(status="ok")
