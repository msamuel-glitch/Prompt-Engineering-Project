# Prompt Engineering Project

Turn long course PDFs and PowerPoint slides into editable, printable study sheets
with flashcards, quizzes and a subject library.

**Status: project definition and repository preparation.** The repository contains
planning documents and folder guidance. Application code, installation commands
and a working demo will be added in later milestones.

## Why we are building this

University students revising several subjects need to condense large amounts of
course material and decide what to practise. Preparing summaries manually takes
time that could otherwise be spent studying.

This project aims to help students create a concise revision resource from their
own course files, check it against the source, adapt it to their needs and test
their understanding. Whether it saves time and produces useful summaries will be
evaluated with real course samples and student feedback.

## Team

| Member | GitHub account | Main responsibility |
| --- | --- | --- |
| TODO | TODO | TODO |

Responsibilities are one of the pre-development decisions in
[PLAN.md](docs/PLAN.md). Every member reviews pull requests and should be able to
explain the whole project.

## The intended experience

1. **Upload a course.** Start with a PDF or PPTX, including courses of 20+ pages
   or slides.
2. **Generate a study sheet.** Receive a structured summary designed to fit two
   A4 pages, with page or slide references on each section.
3. **Review and edit.** Change the text, add or remove sections, reorder content
   or restore the original AI version.
4. **Revise actively.** Study section-based flashcards and take a quiz to identify
   topics that need another review.
5. **Save and return.** Organize sheets by subject, reopen them from the library
   and use browser printing to export a PDF.

## Planned scope

The first complete release includes all of the following core features. They will
be built in smaller milestones, starting with the upload-to-sheet flow.

| Area | Core requirement |
| --- | --- |
| Import | Extract PDF and PPTX content while retaining titles and page or slide numbers. |
| Summary | Generate a concise study sheet with a source reference for every section. |
| Presentation | Render a consistent HTML layout designed for two A4 pages. |
| Editing | Edit text, add, remove and reorder sections, and restore the AI version. |
| Export | Print or save the sheet as a PDF through the browser. |
| Flashcards | Generate revision cards from each section. |
| Quiz and review | Generate a quiz, show a section-level score and flag weak sections for review. The meaning of the requested confidence score is still to be defined. |
| Library | Suggest editable subject tags and filter saved sheets by subject. |

**Optional extensions:** subject-specific templates for maths, finance, marketing
and data; spaced repetition; full-text search; likely exam questions; and course
gap detection. These follow completion and evaluation of the core release.

See the [project background](docs/PROJECT_BRIEF.md) for acceptance criteria,
assumptions and decisions that remain open.

## Planned architecture

Each study sheet is represented as structured JSON. The HTML view, printed PDF,
flashcards and quizzes derive from that shared representation so that they can
remain tied to the same sections and source references.

The intended flow is:

```text
PDF / PPTX → extraction with source references → AI generation → validation
                                                                     ↓
                                                        saved study-sheet JSON
                                                                     ↓
                                                editor · print · cards · quiz
```

| Layer | Technology from the project brief |
| --- | --- |
| Frontend | React, Vite and TypeScript |
| Editor | Tiptap |
| Backend and validation | Python, FastAPI and Pydantic |
| Course extraction | python-pptx and pdfplumber |
| AI generation | Claude API via the Anthropic SDK, using structured output |
| Database | SQLite |
| API types | openapi-typescript, generated from the backend's OpenAPI schema |
| PDF export | `window.print()` and print CSS |

AI calls and credentials belong in the backend. The exact data contracts, model,
dependency versions and behavior after edits will be defined before integration.

## Repository guide

| Path | Purpose |
| --- | --- |
| [backend/](backend/README.md) | API, extraction, AI integration and persistence |
| [frontend/](frontend/README.md) | User interface, editing and print styles |
| [prompts/](prompts/README.md) | Reusable prompts, expected outputs and evaluation examples |
| [data/](data/README.md) | Guidance for local course samples and evaluation data |
| [outputs/](outputs/README.md) | AI outputs kept as evidence for prompt evaluations |
| [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) | Product background, scope boundaries, acceptance criteria and open decisions |
| [docs/PLAN.md](docs/PLAN.md) | Milestones, completion checks and progress |
| [docs/JOURNAL.md](docs/JOURNAL.md) | Dated log of decisions, AI usage and problems encountered |
| [CLAUDE.md](CLAUDE.md) | Shared development conventions |

## How we will work

Start with the project background, resolve the decisions needed for the next
milestone, and then follow the [work plan](docs/PLAN.md):

1. Define the project and organize the repository.
2. Set up the development environment, team workflow and application skeletons.
3. Agree on the data schemas and API contracts using sample responses.
4. Connect upload, extraction, AI generation and saving.
5. Add editing, print layout and the subject library.
6. Add flashcards, quizzes and section review feedback.
7. Evaluate with real courses, gather feedback and prepare the demo.

Keep changes small, check each milestone against its expected result, and record
progress before moving on. Bonus features come after a stable core demo.

## Installation / access

There is nothing to install or run yet.

To prepare for development, the original brief calls for Git, Python 3.11+,
Node.js 20+, VS Code and Claude Code, along with a GitHub account per team
member. Exact supported runtime and dependency versions will be selected during
setup.

Development also needs an Anthropic API key with a spending limit, a small API
budget, and 6–10 PDF/PPTX courses across several subjects for evaluation. Keep
credentials out of Git and local course files under the ignored `data/local/`
directory.

Installation and run instructions will be documented once the applications exist.

## AI usage

AI has two roles in this project.

**In the product.** The backend will send extracted course text to the Claude API
to produce the study sheet and, later, flashcards, quiz questions and subject
tags. Each prompt is versioned in [prompts/](prompts/README.md) with its
evaluation criteria, so that every change is compared with the previous version
on the same test courses.

**In the development process.** We use AI assistants to plan, document and write
code. We review what they produce before committing it and record significant
uses in the [project journal](docs/JOURNAL.md): what was asked, what was kept,
what was changed and why. Commits prepared with Claude Code carry a
`Co-Authored-By` trailer.

| Tool | Role |
| --- | --- |
| Claude API | Planned: generation of study sheets and study aids in the backend |
| Claude Code | Repository audit against the course guidelines, documentation updates and the first study-sheet prompt (29 Sept.) |
| TODO | Other assistants used by team members |

## Main challenges

Implementation has not started, so this section will grow during the project.
Details are kept in the [project journal](docs/JOURNAL.md).

- **Shared Git workflow.** The repository started with a single branch named
  after a team member and no `main` branch. On 29 Sept. we created `main` and
  started working on feature branches merged through pull requests.
- **Scope.** The core feature list is broad for the time available in the course.
  Which features the first demo must include is one of the open decisions in the
  [project background](docs/PROJECT_BRIEF.md#decisions-to-resolve).

## Final result

No part of the application runs yet. The repository contains the project
definition and the work plan; [PLAN.md](docs/PLAN.md) tracks progress.

## Future improvements

To be completed at the end of the project. The candidates identified so far are
the optional extensions listed under [Planned scope](#planned-scope).
