"""The Gemini generator, with a stand-in client: no network, no key needed."""

from types import SimpleNamespace

import pytest
from google.genai import errors as genai_errors

from app.config import get_settings
from app.extraction import Course, CourseUnit
from app.generation import GeminiSheetGenerator, GenerationError
from app.schemas import Section, StudySheet

COURSE = Course("slide", [CourseUnit(1, "Regression\nModel"), CourseUnit(2, "")])
SHEET = StudySheet(
    title="Regression",
    sections=[Section(title="Model", points=["y = a + bx"], sources=[1])],
)


def api_error(code: int, message: str = "error") -> genai_errors.APIError:
    return genai_errors.APIError(code, {"error": {"code": code, "message": message}})


def answer(parsed=SHEET, text=None, finish_reason="STOP", block_reason=None):
    return SimpleNamespace(
        parsed=parsed,
        text=text,
        candidates=[SimpleNamespace(finish_reason=finish_reason)],
        prompt_feedback=SimpleNamespace(block_reason=block_reason) if block_reason else None,
        usage_metadata=SimpleNamespace(prompt_token_count=100, candidates_token_count=50),
    )


class FakeClient:
    """Stands in for genai.Client: answers each model from a set table."""

    def __init__(self, outcomes: dict):
        self.calls = []
        self._outcomes = outcomes
        self.models = SimpleNamespace(generate_content=self._generate)

    def _generate(self, *, model, contents, config):
        self.calls.append({"model": model, "contents": contents, "config": config})
        outcome = self._outcomes[model]
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


def generator(client: FakeClient) -> GeminiSheetGenerator:
    return GeminiSheetGenerator(
        ["main-model", "light-model"], "Summarize:\n{course_text}", "v2", client=client
    )


def test_request_contains_the_course_and_the_output_schema():
    client = FakeClient({"main-model": answer()})

    sheet = generator(client).generate(COURSE)

    assert sheet == SHEET
    call = client.calls[0]
    assert call["model"] == "main-model"
    assert "[Slide 1]" in call["contents"]
    assert call["config"].response_schema is StudySheet
    assert call["config"].response_mime_type == "application/json"


def test_a_busy_model_hands_over_to_the_next_one():
    client = FakeClient({"main-model": api_error(503), "light-model": answer()})
    gen = generator(client)

    sheet = gen.generate(COURSE)

    assert sheet == SHEET
    assert [call["model"] for call in client.calls] == ["main-model", "light-model"]
    # The sheet records the model that actually wrote it.
    assert gen.name == "light-model"


def test_a_rejected_key_is_reported_without_trying_another_model():
    client = FakeClient({"main-model": api_error(400, "API key not valid.")})

    with pytest.raises(GenerationError, match="GEMINI_API_KEY"):
        generator(client).generate(COURSE)
    assert len(client.calls) == 1


def test_quota_used_up_on_every_model_is_reported():
    client = FakeClient({"main-model": api_error(429), "light-model": api_error(429)})

    with pytest.raises(GenerationError, match="quota"):
        generator(client).generate(COURSE)


def test_json_text_is_validated_when_the_sdk_did_not_parse_it():
    client = FakeClient({"main-model": answer(parsed=None, text=SHEET.model_dump_json())})

    assert generator(client).generate(COURSE) == SHEET


def test_an_answer_that_is_not_a_sheet_is_reported():
    client = FakeClient({"main-model": answer(parsed=None, text='{"title": "cut off')})

    with pytest.raises(GenerationError, match="not a valid study sheet"):
        generator(client).generate(COURSE)


def test_a_safety_refusal_is_reported():
    client = FakeClient({"main-model": answer(parsed=None, finish_reason="SAFETY")})

    with pytest.raises(GenerationError, match="declined"):
        generator(client).generate(COURSE)


def test_the_gemini_key_decides_whether_a_key_is_set(monkeypatch):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "gemini")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-value")
    monkeypatch.setenv("GEMINI_API_KEY", "")

    assert get_settings().has_api_key is False

    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")
    assert get_settings().has_api_key is True
