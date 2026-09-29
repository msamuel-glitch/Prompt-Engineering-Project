"""Load prompt templates from the versioned files in prompts/.

The application uses the prompt exactly as documented: the first ```text
block under the "## Prompt" heading of prompts/<task>/<version>_*.md.
"""

import re

from app.config import PROMPTS_DIR

PLACEHOLDER = "{course_text}"

_PROMPT_BLOCK = re.compile(r"^## Prompt\n.*?^```text\n(.*?)^```", re.DOTALL | re.MULTILINE)


class PromptNotFoundError(Exception):
    pass


def load_prompt(task: str, version: str) -> str:
    matches = sorted((PROMPTS_DIR / task).glob(f"{version}_*.md"))
    if len(matches) != 1:
        raise PromptNotFoundError(
            f"Expected one file prompts/{task}/{version}_*.md, found {len(matches)}."
        )
    # Git may check files out with Windows line endings.
    document = matches[0].read_text(encoding="utf-8").replace("\r\n", "\n")
    block = _PROMPT_BLOCK.search(document)
    if block is None or PLACEHOLDER not in block.group(1):
        raise PromptNotFoundError(
            f"{matches[0].name} has no ```text block containing {PLACEHOLDER} "
            'under its "## Prompt" heading.'
        )
    return block.group(1).strip()


def fill_prompt(template: str, course_text: str) -> str:
    # str.replace rather than str.format: course text may contain braces.
    return template.replace(PLACEHOLDER, course_text)
