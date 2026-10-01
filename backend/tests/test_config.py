"""Settings read from the environment or from backend/.env."""

from app.config import BACKEND_DIR, DEFAULT_FIXTURE, get_settings

OPTIONAL = [
    "STUDY_SHEET_GENERATOR",
    "CLAUDE_MODEL",
    "STUDY_SHEET_PROMPT_VERSION",
    "STUDY_SHEET_DB",
    "STUDY_SHEET_FIXTURE",
]


def test_a_variable_left_blank_falls_back_to_its_default(monkeypatch):
    """A key written with no value in .env arrives as "", not as absent.

    Reading it with a plain default would keep the empty string, which turned
    the fixture path into the current directory rather than the recorded sheet.
    """
    for name in OPTIONAL:
        monkeypatch.setenv(name, "")

    settings = get_settings()

    assert settings.generator == "claude"
    assert settings.claude_model == "claude-opus-5-5"
    assert settings.prompt_version == "v2"
    assert settings.db_path == BACKEND_DIR / "data" / "sheets.db"
    assert settings.fixture_path == DEFAULT_FIXTURE


def test_a_variable_that_is_set_is_used(monkeypatch):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "fake")
    monkeypatch.setenv("STUDY_SHEET_DB", "/tmp/other.db")

    settings = get_settings()

    assert settings.generator == "fake"
    assert settings.db_path.name == "other.db"
