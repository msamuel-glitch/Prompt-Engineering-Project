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


def setting(name: str, default: str) -> str:
    """Read a variable, treating an empty value as absent.

    A key left blank in .env, as .env.example shows the optional ones, reaches
    os.getenv as "" rather than None, so a plain default would never apply.
    """
    return os.getenv(name) or default


def get_settings() -> Settings:
    return Settings(
        generator=setting("STUDY_SHEET_GENERATOR", "claude"),
        claude_model=setting("CLAUDE_MODEL", "claude-opus-5-5"),
        prompt_version=setting("STUDY_SHEET_PROMPT_VERSION", "v2"),
        has_api_key=bool(
            os.getenv("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")
        ),
        # Saved sheets live outside Git: data/ is ignored, like local courses.
        db_path=Path(setting("STUDY_SHEET_DB", str(BACKEND_DIR / "data" / "sheets.db"))),
        fixture_path=Path(setting("STUDY_SHEET_FIXTURE", str(DEFAULT_FIXTURE))),
    )
