# Step-by-step work plan

## Working rhythm

Work through the milestones in order. For each task, agree on the expected result,
implement a small change, run the relevant checks, and record the outcome here.
Use focused commits and reviewable pull requests once the team workflow is set up.

Current milestone: **4 — Upload-to-sheet pipeline**. The flow works from upload
to display, but sheets are not saved and the prompt has not been evaluated.
Open items remain in milestones 1–3.
Next action: add an Anthropic API key (milestone 2), then run the prompt
evaluation (prompt track below).

## Prompt track (in parallel with milestones 2–4)

Prompt experiments do not need the application: they run on course text with
page or slide markers. See [prompts/](../prompts/README.md).

- [x] Write study-sheet prompt v1 (baseline), its evaluation protocol and a
      synthetic test course (29 Sept.).
- [x] Write v2 (structured output), required by the application, which reads
      its prompt from `prompts/study-sheet/` (29 Sept.).
- [ ] Choose 2–3 real courses in `data/local/` and list their key points before
      running any prompt on them.
- [ ] Evaluate v1 and v2 on the synthetic and real courses; record scores and
      failures. One v2 run on S1 is recorded in
      `outputs/study-sheet/v2/`, but outside the protocol: a single run, from a
      Claude Code session rather than the application, scored by the model that
      produced it. It needs re-scoring by a teammate and replacing with three
      real runs once a key exists.
- [ ] Write the next version from the observed failures and compare it with the
      previous one on the same courses.
- [ ] Reproduce and document at least one LLM failure mode relevant to the
      project, for example invented source references or instructions hidden in
      an uploaded course.

## 1. Project definition and repository organization

- [x] Read the project brief and inspect the existing repository.
- [x] Rewrite the README as a clear overview of the problem, intended experience,
      scope, architecture and workflow.
- [x] Document the project background, acceptance criteria, proposed boundaries
      and open decisions in PROJECT_BRIEF.md.
- [x] Add backend/, frontend/, prompts/, data/ and docs/ with responsibility notes.
- [x] Add ignore rules for secrets, generated files and local course data.
- [x] Add shared development conventions in CLAUDE.md.
- [x] Record the implementation sequence and completion checks.
- [ ] Resolve the pre-development decisions: deadline, roles, assessment
      requirements, proposed scope boundaries and the intended demo environment.

Completion check: the original requirements are represented clearly, the team
has a shared understanding of the first release and its boundaries, and the
documentation accurately distinguishes planned features from working software.

## 2. Development setup

- [ ] Confirm team roles, deadline and the package manager to use.
- [ ] Verify Python 3.11+, a supported Node.js release satisfying the brief's 20+
      requirement, Git and editor tooling on developer machines.
- [x] Create the shared `main` branch from `mary` (29 Sept.).
- [ ] Make `main` the default branch and require a reviewed pull request to merge
      into it (repository owner, in the GitHub settings).
- [ ] Set up a GitHub Projects board with Todo, In progress, In review and Done.
- [x] Scaffold FastAPI with a health endpoint and explicit Python dependencies
      (pip and a virtual environment, pinned requirements files).
- [x] Scaffold React + Vite + TypeScript and commit its dependency lockfile
      (npm, package-lock.json).
- [x] Document working install/run/check commands and environment variables
      (backend/README.md and frontend/README.md; no variables needed yet).
- [ ] Configure an Anthropic key with a spending limit, and collect 6–10 local
      sample courses without committing them.

Completion check: another teammate can follow the setup instructions, start both
applications, reach the API health endpoint and build the frontend.

## 3. Freeze the data and API contracts

- [ ] Define Pydantic schemas for sheets, sections, source references, flashcards,
      quizzes and subject tags (sheets, sections, source references and subject
      tags done; flashcards and quizzes to come).
- [x] Define how original AI content and student edits are stored and restored:
      both versions are kept, and restoring copies the AI one over the student's.
- [ ] Agree on confidence scoring, weak-section rules, answer checking and the
      minimum content required for a useful two-page summary.
- [ ] Define API routes and return schema-valid fake data (study-sheet, library,
      editing and tag routes done with the fake generator; flashcard and quiz
      routes to come).
- [x] Generate TypeScript types from the OpenAPI schema.

Completion check: the frontend displays a fake sheet using the agreed API shape;
the team has one documented contract for each core feature.

## 4. Build the upload-to-sheet pipeline

- [x] Extract PDF and PPTX text while preserving titles and page/slide identifiers.
- [x] Detect unsupported files, empty extraction and scanned PDFs that need OCR;
      communicate the limitation clearly before proceeding with generation.
- [ ] Implement and evaluate the summary prompt with structured Claude output
      (implemented with prompt v2; not evaluated yet).
- [x] Validate the returned data and source references, then persist the sheet:
      checks re-run on the current version each time a sheet is read, so an
      edited sheet never shows the checks of an older one.
- [x] Connect upload, extraction, generation and display one link at a time.

Completion check: representative PDF and PPTX courses produce saved, readable
study sheets with traceable source references.

## 5. Editing, print and subject library

- [x] Implement text editing, section addition/removal/reordering and restoration
      of the AI version.
- [ ] Add a consistent visual design and A4 print CSS (the A4 print stylesheet
      is in place; a consistent visual identity is still to design).
- [ ] Verify the two-page target on representative courses and handle overflow
      after student edits visibly (overflow is estimated and warned about live
      while editing; the estimate has not been checked against printed courses).
- [ ] Add AI-suggested, editable subject tags and library filtering (editable
      tags and filtering done; tags suggested by the AI to come).

Completion check: a student can edit, save, reopen and print a sheet as two A4
pages, and find it through subject filters.

## 6. Flashcards and quizzes

- [x] Generate flashcards from each section: one card per section, its heading
      asking for its key ideas, with the source pages on the answer.
- [ ] Generate quizzes and implement the agreed section scoring rules. The quiz
      is the one study aid the brief asks the AI for, so it needs a working key.
- [ ] Show review badges on weak sections.
- [x] Define when study aids are regenerated or marked outdated after edits:
      flashcards are derived from the sheet on every render rather than stored,
      so they are never out of date and there is nothing to regenerate.

Completion check: study aids match their sections and quiz results update the
appropriate section's review status.

## 7. Evaluate and prepare the demo

- [ ] Evaluate summary coverage, accuracy, source references and two-page fit
      across the sample courses.
- [ ] Check scanned PDFs, very long courses, API failures and invalid AI responses.
- [ ] Gather feedback from students outside the team and address core issues.
- [ ] Freeze features, polish the demo and record a backup video.

Completion check: the core flow is repeatable and the team can explain known
limitations with evidence from the evaluations.

## 8. Optional extensions

Only after milestone 7: subject templates, spaced repetition, full-text search,
likely exam questions and course gap detection.

## Progress log

| Milestone | Result | Next action |
| --- | --- | --- |
| 1 | Repository layout and conventions added; README rewritten and project background documented locally. Application implementation has not started. | Resolve pre-development decisions in PROJECT_BRIEF.md, then begin development setup. |
| 1–2 | 29 Sept.: `main` created, empty test file removed, README completed with the sections required by the course guidelines, project journal started. | Owner: make `main` the default and protected branch. Team: fill in names and roles in the README. |
| 2–4 | 29 Sept.: backend and frontend skeletons, then the upload-to-sheet flow. It works end to end with the fake generator; the Claude generator is tested against the real SDK with a fake network layer, not yet with a live key. Sheets are not saved. | Add an API key, evaluate prompts v1 and v2, then save sheets in SQLite. |
| 4–5 | 29 Sept.: sheets saved in SQLite, with the library, subject tags, editing and restoration of the AI version, plus the A4 print stylesheet and a two-page fill estimate. Checked with the fake generator and the test suites; no sheet has been generated by Claude or printed on paper yet. | Add an API key and generate a real sheet, check the two-page estimate in the print preview, then build flashcards. |
| 6 | 30 Sept.: flashcards derived from the sections, with reveal, navigation and shuffle. No AI call: the brief derives every study aid from the sheet JSON, and only the quiz is specified as AI-generated. | Build the quiz once an API key is available; decide the confidence score and the weak-section rule first. |
| Prompt track | 30 Sept.: a v2 output on S1 recorded as evidence, and a `fixture` generator that serves it so the application can be shown with real content without a key. It covers the eight key points and avoids the three traps, but it did not come from the application and was scored by its own author. | Re-score it blind, and replace it with three application runs as soon as an API key is available. |
