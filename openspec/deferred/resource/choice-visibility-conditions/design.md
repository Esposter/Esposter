# Choice Visibility Conditions

SurveyJS lets an owner give each choice of a question a visibility condition, so an option appears only when another answer holds. This record covers that condition per choice.

## Why deferred

A choice is a value and a text, with no condition field (`packages/vue-survey-engine-headless/src/models/SurveyChoice.ts`). Adding a condition changes the stored shape of every choice, the choice editor in the property panel, the runner's choice list and the answer check that reads a choice's value. That is an engine model change, and it needs its own design ([survey runner design](../../../specs/resource/survey-runner/design.md)).

**Revisit when:** a survey needs one option of a question shown or hidden by another answer, which a condition on the whole question cannot do.
