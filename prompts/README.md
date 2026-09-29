# Prompts

Reusable AI prompts, their successive versions and their evaluations. Planned
tasks are study-sheet generation, flashcards, quizzes and subject-tag suggestions.

## Layout

```text
prompts/
├── README.md
├── examples/                               synthetic test inputs
│   └── synthetic_course_regression_fr.md
└── study-sheet/
    ├── v1_initial_prompt.md                one file per version
    └── evaluation.md                       protocol, criteria, test set, results
```

## Versions

| Task | Version | Techniques | Status |
| --- | --- | --- | --- |
| Study sheet | [v1](study-sheet/v1_initial_prompt.md) | Zero-shot baseline, plain-language requirements | Awaiting evaluation |

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
