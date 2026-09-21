=> web app that turns long course slides and PDFs into editable 2-page study sheets, with flashcards, a quiz and a subject library.
Project at a glance
Goal
Save students time summarising courses and help them memorise
Users
University students revising several subjects
Input
PowerPoint (PPTX) and PDF courses, 20+ pages
Output
Styled HTML study sheets, printable as 2-page PDFs

Features
Core
Import and extraction of PPTX and PDF files, keeping titles and slide or page numbers.
AI summary that fits on 2 A4 pages, with a source reference (slide or page) on each section.
Styled HTML sheet with a consistent visual identity.
Editing after generation: change text, add, remove and reorder sections, revert to the AI version.
PDF export through the browser's print function.
Flashcards generated from each section.
AI quiz and confidence score per section, with a "review" badge on weak sections.
Subject tags and library: tags suggested by the AI and editable, library filterable by subject.
Bonus : subject-specific templates (maths, finance, marketing, data), spaced repetition, full-text search, likely exam questions, course gap detection.
Architecture
Each sheet is stored as structured JSON; the HTML view, PDF, flashcards and quiz are all derived from it.



Layer
Tool
Frontend
React + Vite (TypeScript), Tiptap editor
Backend
Python, FastAPI, Pydantic
Extraction
python-pptx, pdfplumber
AI
Claude API with structured output
Database
SQLite
PDF export
window.print() + print CSS

Steps
Prepare: install the tools, create the API key, gather 6 to 10 real courses as test data.
Set up the repo: protected main branch, backend and frontend scaffolding, a CLAUDE.md with shared conventions, a GitHub Projects board.
Freeze the contracts: Pydantic schemas (sheet, section, flashcard, quiz), API endpoints stubbed with fake data, TypeScript types generated from the API.
Build the modules in parallel: extraction, AI prompts, sheet design and print CSS, backend and editing, library, flashcards and quiz pages.
Integrate the pipeline one link at a time, from upload to library.
Test and tune: summary quality, 2-page fit, error cases (scanned PDF, API down, very long course), feedback from outside students.
Freeze features, polish and prepare the demo, with a recorded video as backup.
Add bonus features if time allows.
What we need
Accounts: a GitHub account per member, an Anthropic API key with a spending limit, Claude Code.
Software: Git, Python 3.11+, Node.js 20+, VS Code.
Libraries: python-pptx, pdfplumber, FastAPI, Pydantic, Anthropic SDK, React, Vite, Tiptap, openapi-typescript.
Test data: real courses in PPTX and PDF, across several subjects.
Budget: a small amount of API credit for development and testing.
