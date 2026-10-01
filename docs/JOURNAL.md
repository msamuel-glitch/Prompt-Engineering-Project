# Project journal

Dated log of what we did, which decisions we took, how we used AI and what went
wrong. Add an entry after each session or significant piece of work. Keep entries
short and factual: they feed the README and the final presentation.

Template:

```markdown
## YYYY-MM-DD — Title

- **Done:**
- **AI usage:** tool, what it produced, what we checked or changed
- **Decisions:**
- **Problems / failures:** what happened, why, what we tried, what we learned
- **Next:**
```

## 2026-09-16 — Repository created

- **Done:** @msamuel-glitch created the GitHub repository.

## 2026-09-17 — First push

- **Done:** first commit (`test`), containing an empty `test.txt`.

## 2026-09-21 — Initial project brief

- **Done:** @condet-bit wrote the first README: goal, target users, core and
  bonus features, architecture (React, FastAPI, Claude API, SQLite) and the
  step-by-step plan.
- **AI usage:** TODO (author to complete).

## 2026-09-22 — Project definition and repository organization

- **Done:** README rewritten; `PROJECT_BRIEF.md` (scope, acceptance criteria,
  open decisions), `PLAN.md` (seven milestones), `CLAUDE.md` (shared
  conventions), folder READMEs and `.gitignore` added.
- **AI usage:** TODO (author to complete: which tool helped write these
  documents and what was changed by hand).

## 2026-09-29 — Audit against the course guidelines, cleanup, first prompt

- **AI usage:** Claude Code (Claude Opus 5.5) compared the repository with the
  course guidelines (DAT32-91) and prepared this cleanup and the first
  study-sheet prompt.
- **Findings:** no `main` branch (the only branch was `mary`); no pull requests
  or reviews; an empty `test.txt`; the README lacked the Team, AI usage, Main
  challenges, Final result and Future improvements sections required by the
  guidelines; `prompts/` contained no prompt; the core scope is broad for the
  course time.
- **Done:** created `main` from `mary`; removed `test.txt`; added the missing
  README sections, `outputs/` and this journal; started study-sheet prompt v1
  with its evaluation grid in a separate pull request.
- **Decisions:** `main` is the shared base branch; changes reach it through pull
  requests reviewed by another member.
- **Next:** make `main` the default branch and protect it (repository owner);
  fill in names and roles; run the v1 evaluation; resolve the pre-development
  decisions in `PLAN.md`.

## 2026-09-29 — Application skeletons and first feature: course to study sheet

- **AI usage:** Claude Code (Claude Opus 5.5) wrote the backend and frontend
  skeletons, then the upload-to-sheet feature, prompt v2 and their tests. It
  checked the Anthropic SDK's documentation and installed source before writing
  the API call.
- **Done:** FastAPI backend with `POST /api/sheets` (PDF/PPTX extraction with
  pdfplumber and python-pptx, generation with Claude, automatic checks); React
  page to upload a course and read the sheet; prompt v2 with structured output;
  a PowerPoint version of the synthetic course S1; 31 backend and 4 frontend
  tests.
- **Decisions:**
  - Structured output (JSON schema from Pydantic) so that the sheet is data the
    page, and later flashcards and quizzes, can reuse. This required prompt v2.
  - `claude-opus-5-5` by default, the SDK documentation's default, with effort
    `medium`; `claude-sonnet-5-5` costs half as much and can be compared through
    the evaluation (`CLAUDE_MODEL` in `backend/.env`).
  - The API's refusal fallback is enabled, so a safety refusal is retried on
    Anthropic's recommended model.
  - The application reads its prompt from `prompts/study-sheet/`, so the
    documented prompt is the one used.
  - A fake generator (`STUDY_SHEET_GENERATOR=fake`) to work on the interface
    without a key or cost.
  - Pages without text are not sent to the model; courses over 300,000
    characters are refused until a long-course strategy is chosen.
  - Sheets are not saved yet: persistence (SQLite) comes next.
- **Problems / failures:**
  - Starlette 1.7 deprecates `httpx` for its test client: switched to `httpx2`
    after checking on PyPI that it is the official successor.
  - openapi-typescript 7 expects TypeScript 5 while the Vite template uses
    TypeScript 6: installing it failed, so it runs through `npx` with a pinned
    version instead of being a project dependency.
  - Without an Anthropic key, the SDK only fails when sending, with an unclear
    error: the backend now checks for the key first and explains what to set.
  - The Windows console could not print "β" from the synthetic course: a
    display issue only, solved with UTF-8 output.
  - No API key yet: the Claude generator is tested with fakes, including the
    real SDK over a fake network layer, but not against the live API.
- **Next:** add an API key; run prompts v1 and v2 on S1 and real courses and fill
  in the evaluation; save sheets in SQLite.

## 2026-09-29 to 30 — Saving, editing, library, printing, flashcards

Written from the commits of @condet-bit on `feature/print-two-pages`; details
and decisions to be completed by condet-bit.

- **Done:** two-page A4 print stylesheet with a fill estimate; sheets saved in
  SQLite with the AI version kept aside, editing and restoration; subject tags,
  folders and a library of cards; flashcards derived from the sections; a
  `fixture` generator serving a recorded v2 sheet for demonstrations; the site
  design and the name RectoVerso; a first, provisional v2 run on S1.
- **AI usage:** Claude Code with Claude Opus 5, according to the
  `Co-Authored-By` trailers of the thirteen commits.
- **Problems / failures:** recorded in the plan's progress log, among them a
  placeholder sheet indistinguishable from a real summary, which led to showing
  how each sheet was made.

## 2026-09-30 — No API budget: free copy-paste mode, injection test, launcher

- **AI usage:** Claude Code (Claude Opus 5.5) reviewed the state of the project,
  then wrote the copy-paste mode, the S2 course, `start.bat` and their tests.
- **Decisions:**
  - No API spending for now. The copy-paste mode prepares the application's
    exact prompt for claude.ai, whose free plan works, and imports the answer
    through the same validation and checks. The application cannot know which
    model claude.ai used, so imported sheets say "claude.ai (copy-paste)".
  - Since claude.ai cannot enforce the output schema, the v2 prompt file
    documents a "Copy-paste addition" asking for the JSON schema in text. Runs
    made this way are a separate condition, compared only with each other.
  - S2 hides two instructions in an ordinary course, to study prompt injection
    as the guidelines ask: one obvious, one that would add a false statement.
  - `start.bat` starts everything on Windows, so trying the project does not
    require knowing pip or npm.
- **Problems / failures:**
  - The first attempt at a real test failed: the copy of the project used for it
    had no `backend/.env`, so no key. Nothing was charged.
  - The browser built into the development tool refused clipboard access, so
    the "Copy the prompt" button now falls back to selecting the text.
  - The copy-paste mode was tested by importing the recorded S1 sheet, not with a
    live claude.ai run.
- **Next:** run v1 and v2 on S1 and S2 on claude.ai and have a teammate score
  them; open, review and merge the pending pull requests in order.
