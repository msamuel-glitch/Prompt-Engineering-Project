# Study sheet — evaluation

How we compare the versions of the study-sheet prompt. The goal is to decide from
evidence, not from "it looks good", and to be able to show what each change
improved.

## Protocol

1. **Test set.** Use the same courses for every version:
   - **S1**, the [synthetic course](../examples/synthetic_course_regression_fr.md),
     committed in the repository;
   - **C1 to C3**, two or three real courses kept in `data/local/` (not committed),
     covering different subjects, at least one PDF and one PPTX, and one long
     course. Describe them in the table below without copying their content.
2. **Key points first.** Before running any prompt on a course, list the 6 to 10
   points a good sheet must contain. This list is the reference for coverage; do
   not change it after seeing the outputs.
3. **Runs.** Three runs per course and version, with the same model and settings
   for every version. Record the model name, the interface (claude.ai, API) and,
   through the API, the temperature.
4. **Outputs.** Save the S1 outputs in `outputs/study-sheet/<version>/` (see
   [outputs/](../../outputs/README.md)) and the real-course outputs in
   `data/local/`.
5. **Scoring.** Score each run with the grid below, preferably by a member who
   did not write the prompt. Consistency is scored once per course, across the
   three runs.
6. **Conclusion.** Write the two or three main failures and the change they
   justify for the next version. Change one thing at a time where possible, so
   that each improvement can be attributed to its cause.

## Criteria

Each criterion is scored from 1 to 5. Anchors are given for 5, 3 and 1; use 4 and
2 for the cases in between.

| Criterion | Question | 5 | 3 | 1 |
| --- | --- | --- | --- | --- |
| Coverage | Are the key points present? | All of them | About 60 % | Fewer than 40 % |
| Faithfulness | Is every statement supported by the course? | No unsupported or wrong statement | 2–3 unsupported statements, or one error | Many unsupported statements, or a serious error |
| Source references | Does each section cite pages or slides that support it? | Every section, all correct | Some missing, too broad or wrong | Absent or mostly wrong |
| Length | Does the sheet fit two A4 pages? | Within the target | Up to 40 % over | More than twice the target |
| Format | Headed sections, a reference at the end of each, language of the course | All respected | One rule broken | Several rules broken |
| Consistency | Are structure and key points stable across the three runs? | Same structure and points | Noticeable variations | Very different sheets |

**Length target.** Until the print view exists, word count stands in for the
two-page limit, with a provisional target of **at most 900 words**. We will
recalibrate it with the print CSS. A short course like S1 should give a sheet
shorter than the course: content added to fill space counts against
faithfulness.

**Faithfulness** is also where we document hallucinations, one of the LLM
failure modes the course guidelines ask us to study. Copy each invented
statement or reference into the observations with its run.

## Test set

| ID | Subject | Format | Size | Key points listed |
| --- | --- | --- | --- | --- |
| S1 | Statistics (synthetic) | PPTX-like text | 12 slides | Yes, below |
| C1 | TODO | TODO | TODO | No |
| C2 | TODO | TODO | TODO | No |
| C3 | TODO | TODO | TODO | No |

## S1 key points and traps

Key points a good sheet must contain:

1. The model y = β0 + β1·x + ε and the meaning of each term (slide 3).
2. The OLS principle: minimize the sum of squared residuals (slide 4).
3. The estimators β̂1 = Cov(x, y) / Var(x) and β̂0 = ȳ − β̂1·x̄ (slide 4).
4. The interpretation of the slope in the example: +3.5 k€ of sales per extra
   k€ of advertising, on average (slide 5).
5. R² = 1 − SCR/SCT as the share of the variance of y explained by x, with 0.81
   in the example (slide 7).
6. The four assumptions: linearity, independent errors, homoscedasticity,
   normal errors (slide 8).
7. The test of H0: β1 = 0 with the t statistic and the 5 % threshold (slide 9).
8. The pitfalls: correlation is not causation, extrapolation, outliers
   (slide 10).

Traps, whose behavior should be recorded in the observations:

- **Slide 6** announces a graph that was lost during extraction. The sheet must
  not describe its content or cite slide 6 as a source.
- **Slide 11** gives exam logistics, not course content. Record whether it
  appears; the team decides whether it should (a possible rule for v2).
- **Slide 12** has no content and must not be cited.
- **Out-of-course content.** The course only covers simple regression. Mentions
  of multiple regression, adjusted R², residual plots or other material absent
  from the slides count as unsupported statements.

## Results

### Summary by version

Average over all courses and runs.

| Criterion | v1 | v2 | v3 |
| --- | --- | --- | --- |
| Coverage | – | | |
| Faithfulness | – | | |
| Source references | – | | |
| Length | – | | |
| Format | – | | |
| Consistency | – | | |

### Detailed scores

| Version | Course | Run | Model / interface | Date | Coverage | Faithfulness | Sources | Words | Length | Format | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v1 | S1 | 1 | | | | | | | | | |
| v1 | S1 | 2 | | | | | | | | | |
| v1 | S1 | 3 | | | | | | | | | |

Consistency per course and version:

| Version | Course | Consistency | Notes |
| --- | --- | --- | --- |
| v1 | S1 | | |

### Observations and next change

- **v1:** to be written after the evaluation (main failures, examples, change
  planned for v2).
