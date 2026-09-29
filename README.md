# Prompt Engineering Project

Turn long course PDFs and PowerPoint slides into editable, printable study sheets
with flashcards, quizzes and a subject library.

**Status: first feature working.** Upload a PDF or PowerPoint course and get a
study sheet whose sections cite the pages or slides they come from, with
automatic checks on those references. Sheets are not saved yet, and editing,
printing, flashcards, quizzes and the library are still to come. See
[Final result](#final-result).

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

The application runs locally in two parts, each with its own instructions:

1. The [backend](backend/README.md) (Python 3.11+): install, add an Anthropic
   API key to `backend/.env`, then start it with `uvicorn`.
2. The [frontend](frontend/README.md) (Node.js 20.19+ or 22.12+): `npm install`,
   then `npm run dev`, and open http://localhost:5173.

Without an API key, set `STUDY_SHEET_GENERATOR=fake` in `backend/.env` to try the
interface with placeholder sheets, and upload the synthetic course
`prompts/examples/synthetic_course_regression_fr.pptx`.

Create the API key with a spending limit. Keep credentials out of Git and local
course files under the ignored `data/local/` directory.

## AI usage

AI has two roles in this project.

**In the product.** The backend sends the extracted course text to the Claude API,
which returns the study sheet as structured data validated against a schema;
flashcards, quiz questions and subject tags will follow. The application reads
its prompt from the versioned files in [prompts/](prompts/README.md), where each
version is documented with its evaluation criteria, so that every change is
compared with the previous version on the same test courses.

**In the development process.** We use AI assistants to plan, document and write
code. We review what they produce before committing it and record significant
uses in the [project journal](docs/JOURNAL.md): what was asked, what was kept,
what was changed and why. Commits prepared with Claude Code carry a
`Co-Authored-By` trailer.

| Tool | Role |
| --- | --- |
| Claude API | Generation of study sheets in the backend (`claude-opus-5-5` by default, structured output) |
| Claude Code | Repository audit against the course guidelines, documentation, prompts v1 and v2, application skeletons and the upload-to-sheet feature (29 Sept.) |
| TODO | Other assistants used by team members |

## Main challenges

This section will grow during the project. Details are kept in the
[project journal](docs/JOURNAL.md).

- **Shared Git workflow.** The repository started with a single branch named
  after a team member and no `main` branch. On 29 Sept. we created `main` and
  started working on feature branches merged through pull requests.
- **Scope.** The core feature list is broad for the time available in the course.
  Which features the first demo must include is one of the open decisions in the
  [project background](docs/PROJECT_BRIEF.md#decisions-to-resolve).
- **Testing AI features without spending.** The first feature was built before
  the team had an API key. A fake generator builds placeholder sheets, and the
  tests run the real Anthropic SDK against a fake network layer, so everything
  except the model's actual answers could be checked for free.

## Final result

What works today (29 Sept.):

- Uploading a PDF or PPTX course; files without text, such as scanned PDFs, and
  other formats are refused with an explanation.
- Generating a study sheet with Claude from prompt v2, as sections of key points
  that each cite their pages or slides.
- Automatic checks shown to the student: references outside the file or to pages
  without text, sections without a source, sheets over 900 words.
- Downloading the result as JSON, for example to keep evaluation outputs.

Not yet: saving sheets, editing, printing, flashcards, quizzes and the library.
The generation has not been run with a live API key yet, and the prompts have
not been evaluated. [PLAN.md](docs/PLAN.md) tracks progress.

## Future improvements

To be completed at the end of the project. The candidates identified so far are
the optional extensions listed under [Planned scope](#planned-scope).
