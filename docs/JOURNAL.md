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
