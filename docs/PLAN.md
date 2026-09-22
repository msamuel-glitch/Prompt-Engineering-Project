# Step-by-step work plan

## Working rhythm

Work through the milestones in order. For each task, agree on the expected result,
implement a small change, run the relevant checks, and record the outcome here.
Use focused commits and reviewable pull requests once the team workflow is set up.

Current milestone: **1 — Project definition and repository organization**.
Next action: resolve the pre-development decisions in
[PROJECT_BRIEF.md](PROJECT_BRIEF.md) before beginning milestone 2.

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
- [ ] Establish the team's main branch and branch protection on GitHub. At the
      initial inspection, the remote exposed only mary; main does not yet exist.
- [ ] Set up a GitHub Projects board with Todo, In progress, In review and Done.
- [ ] Scaffold FastAPI with a health endpoint and explicit Python dependencies.
- [ ] Scaffold React + Vite + TypeScript and commit its dependency lockfile.
- [ ] Document working install/run/check commands and environment variables.
- [ ] Configure an Anthropic key with a spending limit, and collect 6–10 local
      sample courses without committing them.

Completion check: another teammate can follow the setup instructions, start both
applications, reach the API health endpoint and build the frontend.

## 3. Freeze the data and API contracts

- [ ] Define Pydantic schemas for sheets, sections, source references, flashcards,
      quizzes and subject tags.
- [ ] Define how original AI content and student edits are stored and restored.
- [ ] Agree on confidence scoring, weak-section rules, answer checking and the
      minimum content required for a useful two-page summary.
- [ ] Define API routes and return schema-valid fake data.
- [ ] Generate TypeScript types from the OpenAPI schema.

Completion check: the frontend displays a fake sheet using the agreed API shape;
the team has one documented contract for each core feature.

## 4. Build the upload-to-sheet pipeline

- [ ] Extract PDF and PPTX text while preserving titles and page/slide identifiers.
- [ ] Detect unsupported files, empty extraction and scanned PDFs that need OCR;
      communicate the limitation clearly before proceeding with generation.
- [ ] Implement and evaluate the summary prompt with structured Claude output.
- [ ] Validate the returned data and source references, then persist the sheet.
- [ ] Connect upload, extraction, generation and display one link at a time.

Completion check: representative PDF and PPTX courses produce saved, readable
study sheets with traceable source references.

## 5. Editing, print and subject library

- [ ] Implement text editing, section addition/removal/reordering and restoration
      of the AI version.
- [ ] Add a consistent visual design and A4 print CSS.
- [ ] Verify the two-page target on representative courses and handle overflow
      after student edits visibly.
- [ ] Add AI-suggested, editable subject tags and library filtering.

Completion check: a student can edit, save, reopen and print a sheet as two A4
pages, and find it through subject filters.

## 6. Flashcards and quizzes

- [ ] Generate flashcards from each section.
- [ ] Generate quizzes and implement the agreed section scoring rules.
- [ ] Show review badges on weak sections.
- [ ] Define when study aids are regenerated or marked outdated after edits.

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
