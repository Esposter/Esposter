# Tasks

Build order. The two readers are independent.

## 1. Summary

- [x] 1.1 Rewrite `getSurveySummaryCards` and `getSurveyResponseSummaryCards` over the typed kinds. Test-first: the existing cases of `getSurveySummaryCards.test.ts` re-expressed over typed nodes.
      Verify: every existing case passes over typed nodes, with new cases for `ranking`, `imagepicker`, `slider` and an other answer.

## 2. Dataset

- [x] 2.1 Write the column reader over the typed document and extend `toDatasetColumnValue` for the non-flat answers; remove `SurveyModelElement` and `getSurveyModelDatasetColumns`.
      Verify: a test per column type rule in the design, and a matrix, a multiple text and a dynamic panel answer each produce one JSON text value.
