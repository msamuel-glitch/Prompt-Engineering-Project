"""Build synthetic_course_regression_fr.pptx from its Markdown version.

The PowerPoint file lets anyone try the application on the synthetic course S1.
Run it with the backend environment, which includes python-pptx:

    backend/.venv/Scripts/python prompts/examples/build_synthetic_pptx.py   (Windows)
    backend/.venv/bin/python prompts/examples/build_synthetic_pptx.py       (macOS/Linux)
"""

import re
from pathlib import Path

from pptx import Presentation

HERE = Path(__file__).parent
SOURCE = HERE / "synthetic_course_regression_fr.md"
TARGET = HERE / "synthetic_course_regression_fr.pptx"

TITLE_AND_CONTENT, TITLE_ONLY = 1, 5  # layouts of the default template


def read_slides() -> list[list[str]]:
    """Lines of each slide, from the text block of the Markdown file."""
    document = SOURCE.read_text(encoding="utf-8").replace("\r\n", "\n")
    course = re.search(r"^```text\n(.*?)^```", document, re.DOTALL | re.MULTILINE)
    slides = re.split(r"^\[Slide \d+\]\n", course.group(1), flags=re.MULTILINE)[1:]
    return [slide.strip().splitlines() for slide in slides]


def main() -> None:
    presentation = Presentation()
    for title, *body in read_slides():
        layout = presentation.slide_layouts[TITLE_AND_CONTENT if body else TITLE_ONLY]
        slide = presentation.slides.add_slide(layout)
        slide.shapes.title.text = title
        if body:
            slide.placeholders[1].text = "\n".join(body)
    presentation.save(TARGET)
    print(f"Wrote {TARGET.name} ({len(presentation.slides)} slides)")


if __name__ == "__main__":
    main()
