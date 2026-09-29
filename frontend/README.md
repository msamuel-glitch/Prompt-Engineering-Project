# Frontend

The user interface of the application, built with React, Vite and TypeScript.

**Current state:** a page to upload a course (PDF or PPTX) and read the generated
study sheet: its sections, key points, the pages or slides each section comes
from, and the warnings of the automatic checks. The sheet can be downloaded as
JSON. No environment variable is needed.

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
| `src/main.tsx` | Entry point that mounts the React application |
| `src/App.tsx` | Page: API status, upload and result |
| `src/UploadForm.tsx` | File picker and generate button |
| `src/SheetView.tsx` | Display of a generated sheet |
| `src/sources.ts` | Page and slide references ("Pages 3–5, 8"), tested in `sources.test.ts` |
| `src/api.ts` | Call to `POST /api/sheets` and error messages |
| `src/api-schema.d.ts` | Generated API types; do not edit by hand |
| `vite.config.ts` | Vite configuration, including the `/api` forwarding |
| `package.json`, `package-lock.json` | Dependencies and scripts; commit both |

The project was generated with `npm create vite@latest -- --template react-ts`
and cleaned of the template's demo content.

## Planned responsibilities

- Section editing with Tiptap, reordering and restoring the original AI version.
- A4 print styles and PDF export through window.print().
- Flashcards, quizzes and section review badges.
- Subject tags and a filterable library.

The structured sheet drives rendering and editing. Keep Claude credentials in
the backend; frontend environment variables must not contain secrets.
