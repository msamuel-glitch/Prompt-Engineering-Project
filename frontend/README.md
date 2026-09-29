# Frontend

The user interface of the application, built with React, Vite and TypeScript.

**Current state:** a single page showing whether the backend API answers. No
product feature is implemented yet, and no environment variable is needed.

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

Open http://localhost:5173. The page shows "API: connected" when the backend
answers and "API: unreachable" when it does not. During development, Vite
forwards every request starting with `/api` to the backend on
http://127.0.0.1:8000 (see `vite.config.ts`).

## Check

```bash
npm run build   # type-check with TypeScript, then build into dist/
npm run lint    # lint with oxlint
```

## Structure

| Path | Content |
| --- | --- |
| `src/main.tsx` | Entry point that mounts the React application |
| `src/App.tsx` | Main page |
| `vite.config.ts` | Vite configuration, including the `/api` forwarding |
| `package.json`, `package-lock.json` | Dependencies and scripts; commit both |

The project was generated with `npm create vite@latest -- --template react-ts`
and cleaned of the template's demo content.

## Planned responsibilities

- Course upload and generation progress.
- Study-sheet rendering, section editing with Tiptap, reordering and restoring
  the original AI version.
- A4 print styles and PDF export through window.print().
- Flashcards, quizzes and section review badges.
- Subject tags and a filterable library.

Add Tiptap when implementing editing. Generate API types from the backend's
OpenAPI schema in the contracts milestone.

The structured sheet drives rendering and editing. Keep Claude credentials in
the backend; frontend environment variables must not contain secrets.
