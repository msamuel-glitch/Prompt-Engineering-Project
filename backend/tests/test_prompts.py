import pytest

from app.prompts import PLACEHOLDER, PromptNotFoundError, fill_prompt, load_prompt


@pytest.mark.parametrize("version", ["v1", "v2"])
def test_documented_prompts_can_be_loaded(version):
    template = load_prompt("study-sheet", version)

    assert template.startswith("You are a study assistant")
    assert PLACEHOLDER in template
    assert "```" not in template


def test_unknown_version_is_reported():
    with pytest.raises(PromptNotFoundError):
        load_prompt("study-sheet", "v99")


def test_course_text_with_braces_is_inserted_unchanged():
    assert fill_prompt("Course:\n{course_text}", "f(x) = {1, 2}") == "Course:\nf(x) = {1, 2}"
