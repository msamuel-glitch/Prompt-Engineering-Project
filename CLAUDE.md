# Shared development conventions

## Purpose

Build the study-sheet application described in README.md. Track progress in
docs/PLAN.md and complete one milestone before expanding the scope.
Use docs/PROJECT_BRIEF.md for the product background, acceptance criteria and open
decisions. Keep proposed boundaries distinct from agreed requirements. The
current stage is project definition; application implementation comes afterward.

## Architecture

- Use React, Vite and TypeScript for the frontend, with Tiptap for editing.
- Use Python 3.11+, FastAPI and Pydantic for the backend.
- Extract PPTX with python-pptx and PDF with pdfplumber.
- Call the Claude API from the backend only; keep API keys out of browser code.
- Store application data in SQLite. Keep local databases out of Git.
- Treat the structured study-sheet JSON as the common source for the HTML sheet,
  printable view, flashcards and quiz. Preserve page or slide references.
- Export PDFs with browser printing and print CSS.

## Workflow

- Read the current milestone and relevant folder README before making changes.
- Keep changes small and focused. Record completed work and the next step in
  docs/PLAN.md; do not mark tasks done before checking them.
- Once the team establishes a shared base branch, use short-lived branches and
  pull requests targeting that branch. Do not rename shared branches or rewrite
  shared history as part of routine implementation.
- Keep dependencies in the backend and frontend manifests once those exist.
  Commit the selected package manager's lockfiles for reproducible installs.
- When behavior is implemented, add meaningful checks for it and document the
  commands needed to run it. Do not document unimplemented commands as working.

## Data and AI behavior

- Never commit API keys, uploaded courses, generated private study materials or
  local databases. Put private development samples under data/local/.
- Keep reusable prompts in prompts/ with documented inputs, output contracts and
  a small synthetic example or evaluation case.
- Validate AI output against the agreed schemas. Do not invent source references
  or present unsupported course content as extracted facts.
- Distinguish student confidence from quiz accuracy when defining the scoring
  contract; the README's confidence-score requirement still needs clarification.

## Scope

Prioritize the core features in README.md. Subject templates, spaced repetition,
search, likely exam questions and gap detection are bonus work after the core
demo is stable.
