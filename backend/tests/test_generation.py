import json
from types import SimpleNamespace

import anthropic
import httpx2
import pydantic
import pytest

from app.extraction import Course, CourseUnit
from app.generation import ClaudeSheetGenerator, FakeSheetGenerator, GenerationError
from app.schemas import Section, StudySheet

COURSE = Course("slide", [CourseUnit(1, "Regression\nModel"), CourseUnit(2, "")])
SHEET = StudySheet(
    title="Regression",
    sections=[Section(title="Model", points=["y = a + bx"], sources=[1])],
)


class FakeClient:
    """Stands in for anthropic.Anthropic: records the request, returns a set answer."""

    def __init__(self, response=None, error=None):
        self.request = None
        self._response = response
        self._error = error
        self.beta = SimpleNamespace(messages=SimpleNamespace(parse=self._parse))

    def _parse(self, **request):
        self.request = request
        if self._error:
            raise self._error
        return self._response


def answer(stop_reason="end_turn", parsed_output=SHEET):
    return SimpleNamespace(
        stop_reason=stop_reason,
        parsed_output=parsed_output,
        model="claude-opus-5-5",
        usage=SimpleNamespace(input_tokens=100, output_tokens=50),
    )


def generator(client: FakeClient) -> ClaudeSheetGenerator:
    return ClaudeSheetGenerator(
        "claude-opus-5-5", "Summarize:\n{course_text}", "v2", client=client
    )


def test_request_contains_the_course_and_the_output_schema():
    client = FakeClient(answer())

    sheet = generator(client).generate(COURSE)

    assert sheet == SHEET
    assert client.request["model"] == "claude-opus-5-5"
    assert client.request["output_format"] is StudySheet
    assert client.request["messages"] == [
        {"role": "user", "content": "Summarize:\n[Slide 1]\nRegression\nModel"}
    ]


def test_refusal_is_reported():
    client = FakeClient(answer(stop_reason="refusal", parsed_output=None))

    with pytest.raises(GenerationError, match="declined"):
        generator(client).generate(COURSE)


def test_missing_sheet_is_reported():
    client = FakeClient(answer(stop_reason="max_tokens", parsed_output=None))

    with pytest.raises(GenerationError, match="max_tokens"):
        generator(client).generate(COURSE)


def test_answer_that_does_not_match_the_schema_is_reported():
    with pytest.raises(pydantic.ValidationError) as invalid_json:
        StudySheet.model_validate_json('{"title": "cut off')
    client = FakeClient(error=invalid_json.value)

    with pytest.raises(GenerationError, match="not a valid study sheet"):
        generator(client).generate(COURSE)


def test_network_failure_is_reported():
    request = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    client = FakeClient(error=anthropic.APIConnectionError(request=request))

    with pytest.raises(GenerationError, match="Could not reach"):
        generator(client).generate(COURSE)


def test_real_sdk_sends_the_expected_request_and_reads_the_answer():
    """Runs the real SDK against a fake HTTP transport: no network, no cost."""
    sent = {}

    def fake_api(request: httpx2.Request) -> httpx2.Response:
        sent["headers"] = request.headers
        sent["body"] = json.loads(request.content)
        return httpx2.Response(
            200,
            json={
                "id": "msg_test",
                "type": "message",
                "role": "assistant",
                "model": "claude-opus-5-5",
                "content": [{"type": "text", "text": SHEET.model_dump_json()}],
                "stop_reason": "end_turn",
                "stop_sequence": None,
                "usage": {"input_tokens": 100, "output_tokens": 50},
            },
        )

    client = anthropic.Anthropic(
        api_key="test-key",
        http_client=anthropic.DefaultHttpxClient(transport=httpx2.MockTransport(fake_api)),
    )

    sheet = generator(client).generate(COURSE)

    assert sheet == SHEET
    body = sent["body"]
    assert body["model"] == "claude-opus-5-5"
    assert body["output_config"]["effort"] == "medium"
    assert body["output_config"]["format"]["type"] == "json_schema"
    assert "sources" in json.dumps(body["output_config"]["format"]["schema"])
    assert body["fallbacks"] == "default"
    assert "server-side-fallback-2026-07-01" in sent["headers"]["anthropic-beta"]


def test_fake_generator_builds_one_section_per_page_with_text():
    sheet = FakeSheetGenerator().generate(COURSE)

    assert sheet.title == "Regression"
    assert sheet.sections == [Section(title="Regression", points=["Model"], sources=[1])]
