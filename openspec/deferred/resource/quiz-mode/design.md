# Quiz Mode

SurveyJS scores a survey as a quiz: it marks answers as correct, scores the respondent and shows results, and can set a time limit. This record covers the quiz's scoring and results, and its time limit.

## Why deferred

No kind holds a correct answer or a score prop (`packages/vue-survey-engine-headless/src/models`), and the survey packages have no timer. A quiz is a separate product surface, with its own answer model and results, and the [inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md) treats it that way.

**Revisit when:** an owner asks to score a survey against correct answers or to limit its time, and the quiz surface is designed.
