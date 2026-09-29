# Prompts

Reusable AI prompts, their successive versions and their evaluations. Planned
tasks are study-sheet generation, flashcards, quizzes and subject-tag suggestions.

## Layout

```text
prompts/
├── README.md
├── examples/                               synthetic test inputs
│   ├── synthetic_course_regression_fr.md   course S1 as extracted text
│   ├── synthetic_course_regression_fr.pptx the same course as a PowerPoint file
│   └── build_synthetic_pptx.py             rebuilds the .pptx from the .md
└── study-sheet/
    ├── v1_initial_prompt.md                one file per version
    ├── v2_structured_prompt.md
    └── evaluation.md                       protocol, criteria, test set, results
```

## Versions

| Task | Version | Techniques | Status |
| --- | --- | --- | --- |
| Study sheet | [v1](study-sheet/v1_initial_prompt.md) | Zero-shot baseline, plain-language requirements | Awaiting evaluation |
| Study sheet | [v2](study-sheet/v2_structured_prompt.md) | v1 with structured output (JSON schema) | Used by the application; awaiting evaluation |

The application reads its prompt from these files (`backend/app/prompts.py`):
the version it uses is set by `STUDY_SHEET_PROMPT_VERSION` in `backend/.env`.

## Method

Problem → prompt → output → evaluation → improvement.

- Each version is a new file (`v2_structured_prompt.md`, and so on), so earlier
  versions stay readable. A version is not edited once it has been evaluated.
- Each version states what changed since the previous one and why, and links to
  its results in the evaluation file of its task.
- Versions are compared on the same test courses, with the same model, before a
  change is accepted.

## What each prompt file documents

- Its purpose and required inputs, including source page or slide identifiers.
- The output format it must satisfy and, once the backend contracts exist, the
  schema it is validated against.
- Instructions for missing information and source references.
- A small synthetic example and the criteria used to judge the result.

Do not copy private course content or credentials into committed examples.
