# Frontend

This folder will contain the React + Vite application in TypeScript. It is not
scaffolded yet.

Planned responsibilities:

- Course upload and generation progress.
- Study-sheet rendering, section editing with Tiptap, reordering and restoring
  the original AI version.
- A4 print styles and PDF export through window.print().
- Flashcards, quizzes and section review badges.
- Subject tags and a filterable library.

During the setup milestone, create the minimal Vite application and document its
install, development and build commands. Add Tiptap when implementing editing.
Generate API types from the backend's OpenAPI schema in the contracts milestone.

The structured sheet drives rendering and editing. Keep Claude credentials in
the backend; frontend environment variables must not contain secrets.
