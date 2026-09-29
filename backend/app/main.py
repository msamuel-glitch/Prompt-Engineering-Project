"""FastAPI application: entry point of the study-sheet API."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Study sheet API", version="0.1.0")


class HealthResponse(BaseModel):
    status: Literal["ok"]


# Routes live under /api so that the frontend dev server can forward them.
@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Tell clients that the API is running."""
    return HealthResponse(status="ok")
