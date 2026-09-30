# Study sheet — v2 (structured output)

| | |
| --- | --- |
| Task | Turn the extracted text of a course into a study sheet |
| Techniques | Zero-shot, role, structured output (JSON schema) |
| Change from v1 | The answer is JSON data matching a schema instead of free Markdown |
| Status | Used by the application; awaiting evaluation |
| Written | 29 Sept. 2026, drafted with Claude Code, to be reviewed by the team |

## Why this version

The application needs the sheet as data, not as free text: the web page, and
later the print view, flashcards and quiz, all derive from the same sections and
their source numbers (see the README's planned architecture). v2 therefore asks
for a structured answer, which the API enforces with a JSON schema.

This change comes from the architecture, not from the v1 evaluation, which has
not been run yet. Everything else is kept from v1, so evaluating both versions on
the same test set shows whether structuring the answer changes its quality.

## What changed from v1

| v1 | v2 |
| --- | --- |
| "Organize it into sections with headings. At the end of each section, indicate the pages or slides it comes from, for example (Slides 4–6)." | "Organize it into sections. For each section, give a title, its key points, and the numbers of the pages or slides it comes from." |
| Free Markdown answer | JSON answer matching the schema below, enforced by the API |

## Input

Same as v1: `{course_text}`, with a `[Page N]` or `[Slide N]` marker before each
page or slide. The application builds it from the uploaded file
(`backend/app/extraction.py`) and leaves out pages without text.

## Prompt

The application reads the block below from this file: editing it changes what
the application sends.

```text
You are a study assistant for university students.

Below is the text of a course, extracted from a PDF or PowerPoint file. Each page or slide starts with a marker such as [Page 3] or [Slide 3].

Write a study sheet that summarizes this course for a student preparing for an exam. The study sheet must fit on two A4 pages. Organize it into sections. For each section, give a title, its key points, and the numbers of the pages or slides it comes from. Write in the same language as the course.

Course:
<<<
{course_text}
>>>
```

## Output schema

Defined by the Pydantic models `StudySheet` and `Section` in
`backend/app/schemas.py` and sent through the API's structured outputs. The field
descriptions reach the model, so they are part of the prompt:

| Field | Type | Description sent to the model |
| --- | --- | --- |
| `title` | text | Title of the course |
| `sections[].title` | text | Short heading of the section |
| `sections[].points` | list of texts | Key ideas of the section, one short sentence or formula each |
| `sections[].sources` | list of numbers | Numbers of the pages or slides this section is based on |

## Request settings

Set in `backend/app/generation.py`: model from `CLAUDE_MODEL` (default
`claude-opus-5-5`), effort `medium`, `max_tokens` 16,000, a single user message,
and the API's refusal fallback enabled. Record the model with every result.

## Copy-paste addition

In the application's free copy-paste mode, the student runs the prompt on
claude.ai, which cannot enforce the schema. The application then appends the
block below to the prompt, with `{schema}` replaced by the JSON schema of
`StudySheet`, field descriptions included, and reads the JSON answer the student
pastes back (`backend/app/paste.py`).

```text
Answer with one JSON object only, with no text before or after it, matching this JSON schema:
{schema}
```

This is a different condition from the API: the schema is asked for in text
instead of being enforced, and the model and settings are claude.ai's. Record
runs made this way as "claude.ai (copy-paste)" and compare them only with runs
made the same way.

## What to check

1. **Quality compared with v1.** Does the structured format lower coverage or
   faithfulness on the same courses?
2. **Source numbers.** The application flags numbers outside the file and pages
   without text. Whether a cited page really supports its section remains a
   human check.
3. **Length.** The application counts words and warns above 900.
4. **S1 traps.** Same as for v1: the lost graph (slide 6), exam logistics
   (slide 11) and the empty slide (slide 12).

## Results

See [evaluation.md](evaluation.md#results). Summary: to be written after the
evaluation.
