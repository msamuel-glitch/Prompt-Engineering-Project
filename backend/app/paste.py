"""Free copy-paste mode: the student runs the prompt on claude.ai.

Without an API key, the application cannot call Claude itself. It can still
prepare the exact prompt for a course, which the student pastes into claude.ai
(the free plan works), and then read the answer the student pastes back.
"""

import json
import re

import pydantic

from app.extraction import Course
from app.prompts import (
    SCHEMA_PLACEHOLDER,
    fill_prompt,
    load_paste_addition,
    load_prompt,
)
from app.schemas import StudySheet

# Recorded as the generator of imported sheets: the model is whichever one
# claude.ai used, which the application cannot know.
PASTE_GENERATOR = "claude.ai (copy-paste)"

_FENCED_BLOCK = re.compile(r"```[a-zA-Z]*\s*\n(.*?)```", re.DOTALL)


class AnswerError(Exception):
    """The pasted answer is not a usable study sheet; the message says why."""


def build_paste_prompt(course: Course, version: str) -> tuple[str, bool]:
    """The prompt to paste, and whether its answer can be imported.

    A version whose file has a copy-paste addition asks for the JSON of
    StudySheet, which the application can import. Other versions, such as v1,
    ask for free text: their answer is for evaluation by hand only.
    """
    prompt = fill_prompt(load_prompt("study-sheet", version), course.to_prompt_text())
    addition = load_paste_addition("study-sheet", version)
    if addition is None:
        return prompt, False
    schema = json.dumps(StudySheet.model_json_schema(), indent=2, ensure_ascii=False)
    return f"{prompt}\n\n{addition.replace(SCHEMA_PLACEHOLDER, schema)}", True


def parse_answer(text: str) -> StudySheet:
    """Read the study sheet out of an answer pasted from claude.ai.

    Claude often wraps JSON in a ```json block or adds a sentence around it,
    so the first fenced block is preferred, then the outermost braces.
    """
    fenced = _FENCED_BLOCK.search(text)
    candidate = fenced.group(1) if fenced else text
    start, end = candidate.find("{"), candidate.rfind("}")
    if start == -1 or end < start:
        raise AnswerError(
            "No JSON object was found in the answer. Copy Claude's whole reply, "
            "including the braces { }."
        )
    try:
        return StudySheet.model_validate_json(candidate[start : end + 1])
    except pydantic.ValidationError as error:
        problem = error.errors()[0]
        where = ".".join(str(part) for part in problem["loc"]) or "answer"
        raise AnswerError(
            f"The answer does not match the study-sheet format ({where}: "
            f"{problem['msg']}). Ask Claude to answer again with the JSON only."
        ) from error
