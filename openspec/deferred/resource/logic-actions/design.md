# Logic Actions

SurveyJS's logic runs actions as well as conditions. An action completes the survey as a conditional step, sets an answer, copies an answer to another question, skips to a question, runs an expression, or changes the Complete page's markup by a condition. This record covers those six actions.

## Why deferred

The logic a survey holds is conditions, which show, hide, enable or require an element ([survey logic builder design](../../../specs/resource/survey-logic-builder/design.md)). An action writes a value or moves the respondent, and the runner keeps respondent answers and the calculated values a result includes, and moves page by page ([survey runner design](../../../specs/resource/survey-runner/design.md)). A value-writing action needs a way to hold a value the respondent did not type. A jump needs a target the runner does not have. The Complete page's markup is one static root prop (`packages/vue-survey-engine-headless/src/models/SurveyRootProps.ts`). This is the largest absent area of the logic, and it needs a design of its own.

**Revisit when:** an owner needs logic to set, copy or skip an answer, and not only to show, hide, enable or require one. That is when the logic actions design is written.
