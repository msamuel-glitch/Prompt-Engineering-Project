"""Settings read from environment variables or from backend/.env."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROMPTS_DIR = BACKEND_DIR.parent / "prompts"
OUTPUTS_DIR = BACKEND_DIR.parent / "outputs"
DEFAULT_FIXTURE = OUTPUTS_DIR / "study-sheet" / "v2" / "synthetic_regression_run1.json"

load_dotenv(BACKEND_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    generator: str  # "claude", or "fake" to build placeholder sheets without AI
    claude_model: str
    prompt_version: str
    has_api_key: bool
    db_path: Path
    fixture_path: Path


def get_settings() -> Settings:
    return Settings(
        generator=os.getenv("STUDY_SHEET_GENERATOR", "claude"),
        claude_model=os.getenv("CLAUDE_MODEL", "claude-opus-5-5"),
        prompt_version=os.getenv("STUDY_SHEET_PROMPT_VERSION", "v2"),
        has_api_key=bool(
            os.getenv("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")
        ),
        # Saved sheets live outside Git: data/ is ignored, like local courses.
        db_path=Path(os.getenv("STUDY_SHEET_DB", BACKEND_DIR / "data" / "sheets.db")),
        fixture_path=Path(os.getenv("STUDY_SHEET_FIXTURE", DEFAULT_FIXTURE)),
    )
