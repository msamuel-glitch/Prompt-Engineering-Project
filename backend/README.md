# Backend

This folder will contain the Python application. It is not scaffolded yet.

Planned responsibilities:

- FastAPI endpoints and Pydantic request/response contracts.
- PPTX and PDF extraction with page or slide identifiers.
- Claude API calls and validation of structured responses.
- Study-sheet persistence, edit history or original AI versions, and the subject library in SQLite.
- Flashcard and quiz generation, plus scoring based on the agreed contract.

During the setup milestone, create a minimal application and dependency manifest,
document environment configuration, and add a health endpoint with a smoke check.
Organize modules as those responsibilities are implemented. Define schemas and
stub responses before integrating extraction or live AI calls.

Keep API credentials on the server. Local uploads, exports and databases are
ignored by Git. Reusable prompt text belongs in the root prompts/ directory.
