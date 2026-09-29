# Outputs

AI outputs kept as evidence for prompt evaluations, so that anyone can compare
prompt versions without running them again.

- Commit outputs generated from synthetic or shareable examples, organized as
  `outputs/<task>/<version>/<example>_run<N>.md`, for example
  `outputs/study-sheet/v1/synthetic_regression_run1.md`.
- Start each file with the model, the interface (claude.ai, API, etc.), relevant
  settings and the date, then paste the output unchanged.
- Outputs generated from private course files stay in `data/local/`, which is
  ignored by Git. Record only their scores and observations in the evaluation
  file of the prompt concerned.
