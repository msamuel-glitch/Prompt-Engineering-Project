# Study sheet — v1 (initial prompt)

| | |
| --- | --- |
| Task | Turn the extracted text of a course into a study sheet |
| Techniques | Zero-shot, role, plain-language requirements |
| Status | Awaiting evaluation |
| Written | 29 Sept. 2026, drafted with Claude Code, to be reviewed by the team |

## Why this version

v1 is a baseline. It states the product requirements in plain language (a
summary for exam revision, two A4 pages, a source reference per section, the
language of the course) without other prompt-engineering techniques: no output
schema, no examples and no explicit rule against content that is not in the
course.

Measuring what this version gets wrong tells us which techniques are worth adding
in v2, and gives a reference point to show their effect.

## Input

`{course_text}`: the text extracted from the course, with each page or slide
preceded by a marker such as `[Page 3]` or `[Slide 3]`. The
[synthetic course](../examples/synthetic_course_regression_fr.md) shows the
format.

Until the extraction module exists (PLAN milestone 4), prepare this text by
copying each page or slide under its marker. For long courses, a small extraction
script will save a lot of time.

## Prompt

Send as a single user message, replacing `{course_text}`:

```text
You are a study assistant for university students.

Below is the text of a course, extracted from a PDF or PowerPoint file. Each page or slide starts with a marker such as [Page 3] or [Slide 3].

Write a study sheet that summarizes this course for a student preparing for an exam. The study sheet must fit on two A4 pages. Organize it into sections with headings. At the end of each section, indicate the pages or slides it comes from, for example (Slides 4–6). Write in the same language as the course.

Course:
<<<
{course_text}
>>>
```

## Expected output

A study sheet in Markdown: sections with headings, each ending with its source
reference. There is no machine-readable format yet. The JSON schema will come
with the data contracts (PLAN milestone 3) and is a candidate change for v2.

## What to check

These are hypotheses about the weaknesses of a baseline, not results. The
[evaluation](evaluation.md) confirms or rejects each one.

1. **Length.** A model cannot measure "two A4 pages", so the sheet may be too
   long or too short. Checked with a word count.
2. **Source references.** References may be missing, too broad (for example
   "Slides 1–12") or point to slides without usable content.
3. **Unsupported content.** Nothing forbids adding knowledge that is not in the
   course. It may look useful, but it breaks the promise of a sheet whose content
   can be checked against the source. This is the hallucination failure mode
   from the course guidelines.
4. **Format drift.** The structure may change between runs, which would make the
   output hard to convert to the future JSON contract.
5. **Language.** The instructions are in English: check that a French course
   produces a French sheet.

## Results

See [evaluation.md](evaluation.md#results). Summary: to be written after the
evaluation.
