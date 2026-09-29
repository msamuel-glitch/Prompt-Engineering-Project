# Frontend

The user interface of the application, built with React, Vite and TypeScript.

**Current state:** upload a course (PDF or PPTX), read the generated study
sheet with the pages or slides each section comes from and the warnings of the
automatic checks, edit it, file it under subject tags, reopen it from the
library, revise it with flashcards and print it on two A4 pages. The sheet can
also be downloaded as JSON. No environment variable is needed.

## Setup

Requires Node.js 20.19+ or 22.12+ (the current LTS release works). From this
`frontend/` folder:

```bash
npm install
```

## Run

Start the [backend](../backend/README.md) first, then:

```bash
npm run dev
```

Open http://localhost:5173. The header shows "API: connected" when the backend
answers. During development, Vite forwards every request starting with `/api` to
the backend on http://127.0.0.1:8000 (see `vite.config.ts`).

To try the interface without an API key, start the backend with
`STUDY_SHEET_GENERATOR=fake` and upload
`prompts/examples/synthetic_course_regression_fr.pptx`.

## Check

```bash
npm test        # unit tests with Vitest
npm run build   # type-check with TypeScript, then build into dist/
npm run lint    # lint with oxlint
```

## API types

`src/api-schema.d.ts` is generated from the backend's OpenAPI schema, so the
frontend uses the same data shapes as the backend. After changing
`backend/app/schemas.py`, run this with the backend running and commit the
result:

```bash
npm run api:types
```

The script runs openapi-typescript through `npx` instead of installing it: its
current version expects TypeScript 5, while this project uses TypeScript 6.

## Structure

| Path | Content |
| --- | --- |
| `src/index.css` | Design tokens and base element styles: colours, spacing, buttons, fields |
| `src/main.tsx` | Entry point that mounts the React application |
| `src/App.tsx` | Page: API status, upload, the open sheet and the library |
| `src/UploadForm.tsx` | File picker and generate button |
| `src/SheetView.tsx` | Display of a sheet, with the print button and the two-page gauge |
| `src/SheetEditor.tsx` | Form to rewrite, add, remove and reorder the sections |
| `src/Flashcards.tsx` | Revision mode: one card per section, reveal and shuffle |
| `src/cards.ts` | Flashcards derived from a sheet, tested in `cards.test.ts` |
| `src/Library.tsx` | Saved sheets, newest first, narrowed by subject |
| `src/TagEditor.tsx` | Subject tags of the open sheet |
| `src/edits.ts` | Operations on a sheet as pure functions, tested in `edits.test.ts` |
| `src/fit.ts` | Two-page fill estimate, tested in `fit.test.ts` |
| `src/App.css` | Component styles, built on the tokens in `index.css` |
| `src/print.css` | A4 print layout; its type size matches the constants in `fit.ts` |
| `src/sources.ts` | Page and slide references ("Pages 3–5, 8"), tested in `sources.test.ts` |
| `src/api.ts` | Calls to the sheet routes and error messages |
| `src/api-schema.d.ts` | Generated API types; do not edit by hand |
| `vite.config.ts` | Vite configuration, including the `/api` forwarding |
| `package.json`, `package-lock.json` | Dependencies and scripts; commit both |

The project was generated with `npm create vite@latest -- --template react-ts`
and cleaned of the template's demo content.

## Editing without Tiptap

The project plan lists Tiptap as the editor. The sheet is not rich text: it is
structured data, a title and a list of sections each holding short key ideas and
source numbers. Plain form fields map onto that structure directly, one field
per value, and keep the saved sheet valid against the backend schema by
construction. Tiptap would add a rich-text document to convert back and forth.

This is a deliberate departure from the plan's tool list, not an oversight. If
the team wants Tiptap, the place for it is the key-idea fields, and `edits.ts`
would stay as it is.

## Visual design

`index.css` holds the tokens — colours, spacing, radii, shadows, two type
families — and the base styles for buttons and fields. `App.css` only composes
them, so a change of palette or rhythm happens in one file.

The look is notes on a desk: a warm paper surface, white sheets raised off it,
an ink-blue accent, and a serif for the study sheet against the system sans of
the interface around it. **No web fonts**: a demonstration must not depend on
the network, so the stacks fall back to fonts present on every platform.

Print overrides all of it. `print.css` strips the card — border, shadow,
padding — so the sheet becomes the page, and fixes the type at 11pt to match
the character budget in `fit.ts`.

## Flashcards without an AI call

The brief derives every study aid from the stored sheet JSON, and asks the AI
only for the quiz. A flashcard is therefore a rearrangement of text the model
already wrote: the section heading becomes the question, its key ideas the
answer. Deriving them on every render rather than storing them also settles when
study aids go stale after an edit — they cannot.

## Planned responsibilities

- The quiz, its confidence score and the review badges on weak sections. This is
  the one study aid that needs a working API key.
- Subject tags suggested by the AI, on top of the editable ones.
- A consistent visual identity for the sheet.

The structured sheet drives rendering and editing. Keep Claude credentials in
the backend; frontend environment variables must not contain secrets.
