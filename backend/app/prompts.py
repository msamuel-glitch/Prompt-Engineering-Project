"""Load prompt templates from the versioned files in prompts/.

The application uses the prompt exactly as documented: the first ```text
block under the "## Prompt" heading of prompts/<task>/<version>_*.md. A version
may also document a "## Copy-paste addition" block, appended when the student
runs the prompt on claude.ai instead of through the API.
"""

import re
from pathlib import Path

from app.config import PROMPTS_DIR

PLACEHOLDER = "{course_text}"
SCHEMA_PLACEHOLDER = "{schema}"


class PromptNotFoundError(Exception):
    pass


def load_prompt(task: str, version: str) -> str:
    return _load_block(task, version, "Prompt", PLACEHOLDER)


def load_paste_addition(task: str, version: str) -> str | None:
    """The copy-paste addition of a version, or None if it documents none."""
    try:
        return _load_block(task, version, "Copy-paste addition", SCHEMA_PLACEHOLDER)
    except PromptNotFoundError:
        return None


def fill_prompt(template: str, course_text: str) -> str:
    # str.replace rather than str.format: course text may contain braces.
    return template.replace(PLACEHOLDER, course_text)


def _load_block(task: str, version: str, heading: str, placeholder: str) -> str:
    path = _prompt_file(task, version)
    # Git may check files out with Windows line endings.
    document = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    # The block must sit in the section itself, before the next "## " heading.
    block = re.search(
        rf"^## {re.escape(heading)}\n(?:(?!^## ).)*?^```text\n(.*?)^```",
        document,
        re.DOTALL | re.MULTILINE,
    )
    if block is None or placeholder not in block.group(1):
        raise PromptNotFoundError(
            f"{path.name} has no ```text block containing {placeholder} "
            f'under its "## {heading}" heading.'
        )
    return block.group(1).strip()


def _prompt_file(task: str, version: str) -> Path:
    matches = sorted((PROMPTS_DIR / task).glob(f"{version}_*.md"))
    if len(matches) != 1:
        raise PromptNotFoundError(
            f"Expected one file prompts/{task}/{version}_*.md, found {len(matches)}."
        )
    return matches[0]
