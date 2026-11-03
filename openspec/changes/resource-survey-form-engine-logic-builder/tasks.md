# Tasks

Build order. The two services come first; the components use them.

## 1. Services

- [ ] 1.1 Write `buildSurveyCondition` and `parseSurveyConditionRows`. Test-first: rows round-trip through the text, and a nested or function expression returns no rows.
      Verify: a condition built from rows evaluates true and false on fixed answers through the expression package.

## 2. Components

- [ ] 2.1 Build `LogicBuilder.vue` for the three conditions with the raw field and the error.
      Verify: both scenarios in the spec delta are component tests, and an unparsable text saves nothing.
- [ ] 2.2 Build `CalculatedValues.vue`.
      Verify: a calculated value added with a name that collides with a question is refused with the survey check's message.
