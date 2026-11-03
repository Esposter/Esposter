# Tasks

Build order. The state and flow functions come first; answer validation is independent of them and is built at the same time.

## 1. State and flow

- [ ] 1.1 Write the models, `createSurveyRunnerState`, `getSurveyRunnerValues`, the three condition checks, the page and element views and `setSurveyAnswer`. Test-first from the first three scenarios in the spec delta.
      Verify: each scenario is a test, and a calculated value that reads an earlier one settles within five passes.
- [ ] 1.2 Write `validateSurveyPage`, `goToNextSurveyPage`, `goToPreviousSurveyPage`, `completeSurvey` and `getSurveyProgress`.
      Verify: each remaining scenario in the spec delta is a test, and a hidden page is skipped in both directions.

## 2. Answers

- [ ] 2.1 Write `createSurveyAnswerSchema` for the input kinds `text`, `comment`, `boolean`, `radiogroup`, `dropdown`, `checkbox`, `tagbox`, `buttongroup`, `rating`, `slider` and `ranking`.
      Verify: each kind has a case that accepts a valid answer and a case that refuses an invalid one with the shared message.
- [ ] 2.2 Write `createSurveyAnswerSchema` for `matrix`, `matrixdynamic`, `paneldynamic`, `multipletext`, `imagepicker` and `expression`, and `validateSurveyAnswers`.
      Verify: as 2.1, a draft accepts a missing required answer and a submit refuses it, and a pattern runs on the RE2 engine.

## 3. App port

- [ ] 3.1 Write `useSurveyRunner`, the reactive wrapper that holds the state in a ref and exposes the page's elements, the errors and the moves.
      Verify: a composable test moves through a two-page document and reports the blocked move's first error name.
