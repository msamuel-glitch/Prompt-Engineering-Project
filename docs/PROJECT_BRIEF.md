# Project background and definition

This document expands the [README](../README.md) into a shared starting point for
product and implementation decisions. Requirements inherited from the original
brief are described as core scope. Proposed boundaries and unresolved decisions
are identified explicitly; they are not completed features or validated results.

## Problem and audience

The target users are university students revising several subjects from long
course PDFs and PowerPoint presentations. Their task is to identify essential
ideas, prepare a usable summary and practise recalling the material.

The project hypothesis is that a source-linked, editable summary combined with
active recall tools can reduce preparation time and support revision. We will
test that hypothesis with course samples and feedback from students outside the
project team. No improvement in study time or learning outcomes has been measured
yet.

## Product goal

Help a student turn a course into a concise study resource they can inspect,
correct, print and revisit. The core output is a styled study sheet designed for
two A4 pages, supported by flashcards, a quiz and a subject library.

A short sheet necessarily selects and compresses content. Its usefulness depends
on retaining the course's essential ideas and making their sources easy to find.
The precise rules for selecting content must be agreed during prompt evaluation.

## Example user journey

A student uploads a lecture PDF. The application extracts text with page numbers,
generates a structured summary and displays the resulting sections with source
references. The student checks the content, rewrites an explanation and saves the
sheet under an editable subject tag.

The student prints the sheet, revises its flashcards and takes a quiz. Section
review indicators point to topics that need more practice. Later, the student
filters the library by subject and reopens the saved sheet.

This is an intended journey, not a description of an existing application.

## Scope and proposed boundaries

The core release includes PDF/PPTX extraction, source-linked summaries, section
editing and restoration, two-page printing, flashcards, quizzes, review feedback,
editable tags and a subject library. The README lists the optional extensions.

To keep the first implementation manageable, the following boundaries are
**proposed and still need agreement**:

- Start with text-based PDFs and PPTX files. Detect scanned or image-only content
  and explain the limitation; OCR is not specified in the original brief.
- Start with a local development demo. Authentication, shared libraries and a
  public deployment need separate decisions before they become requirements.
- Do not promise accurate interpretation of diagrams, complex tables or equations
  until the extraction approach has been evaluated on those materials.
- Treat two-page fit as a generation and print-layout requirement. Decide how
  to handle edits that add more content than can fit legibly.

## What successful core behavior looks like

These qualitative acceptance criteria guide implementation. Numeric targets and
test conditions remain to be agreed before evaluating the application.

| Area | Evidence to collect |
| --- | --- |
| Extraction | Representative PDFs and PPTX files retain usable text, titles and correct page/slide identifiers. |
| Summary quality | Human review finds essential course ideas represented without unsupported claims. |
| Traceability | Each generated section references existing source pages/slides, and those sources support its content. |
| Print quality | Representative generated sheets fit two A4 pages with readable text and no clipped content under documented print settings. |
| Editing | Text and section changes persist after reopening; restoring the AI version behaves as specified. |
| Study aids | Flashcards and quiz answers are supported by their sections; changes to sections do not silently leave outdated study aids. |
| Review feedback | Section scores and review badges follow a documented rule that a student can understand. |
| Library | Edited subject tags persist and filtering returns the expected sheets. |
| Failure handling | Unsupported or scanned files, empty extraction, very long courses, API failures and invalid AI output produce understandable outcomes. |
| Student usefulness | Outside students complete the revision flow and describe where it helps or causes confusion. |

## Prompt-engineering approach

Prompt development is a core part of this project. It includes defining the task,
grounding generation in course content, enforcing output contracts and evaluating
results consistently.

1. Establish a baseline prompt using extracted course text with source identifiers.
2. Require structured output matching the agreed study-sheet schema.
3. Evaluate coverage, factual support, source references and length on a stable
   set of examples.
4. Change a focused part of the prompt and compare the results on the same examples.
5. Record the prompt version, model identifier, relevant generation settings,
   results and observed failure cases so the comparison can be repeated.

Schema validation checks the shape of an answer. Source checks and human review
are also needed to assess whether its content is supported. The two-page target
must be tested in the rendered print view, not inferred from the prompt alone.

## Decisions to resolve

| Decision | Why it matters | When to resolve |
| --- | --- | --- |
| Deadline, team roles and assessment requirements | Determines feasible scope and ownership. | Before development setup |
| Agreement on the proposed boundaries above | Establishes what the first demo must handle. | Before development setup |
| Local or hosted demo; single-user or account-based use | Affects deployment, storage and access design. | Before application scaffolding |
| Package manager, runtime versions and shared Git branch | Gives teammates a consistent environment and workflow. | During development setup |
| Supported course languages, sizes and file limits | Determines extraction and generation constraints. | Before upload/API contracts are finalized |
| Required summary content and meaning of the two-page target | Determines prompt priorities, layout limits and overflow behavior. | Before sheet contracts are finalized |
| Meaning of confidence score and weak-section threshold | Distinguishes student self-assessment from quiz performance; neither should imply guaranteed mastery. | Before quiz contracts are finalized |
| Editing, restoration and study-aid refresh behavior | Determines how original content, saved edits and derived materials relate. | Before data contracts are finalized |
| Upload retention and deletion behavior | Determines which files and generated records are kept and for how long. | Before persistence is implemented |
| Claude model, API budget and long-course strategy | Determines generation limits and evaluation cost. | Before live AI integration |
| Quality thresholds and evaluation record format | Makes acceptance decisions repeatable. | Before prompt comparisons begin |

These decisions are recorded here to guide discussion. Values should be filled in
as they are agreed, rather than assumed silently during implementation.

## Evaluation and delivery

Gather 6–10 course files across several subjects, including PDF and PPTX examples,
long courses and difficult extraction cases. Keep private samples and generated
outputs in `data/local/`, as described in the [data guide](../data/README.md).

Use these examples to check extraction, summary quality, reference accuracy,
print fit and failure handling. Gather feedback from students outside the team,
fix core issues, then prepare a repeatable demo and a backup video. Add optional
features only if the core release is stable and time remains.

Follow [PLAN.md](PLAN.md) for the implementation sequence and progress log.
