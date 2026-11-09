# Validator Warnings

SurveyJS validators can warn an answer without blocking the respondent, so a notice shows and the move goes on. This record covers that non-blocking severity.

## Why deferred

A survey validator holds an expression and a message and nothing else (`packages/vue-survey-engine-headless/src/models/SurveyValidator.ts`), and every failure blocks the move ([survey runner design](../../../specs/resource/survey-runner/design.md)). A warning needs a severity on the validator model, and a runner state that holds warnings beside the errors the moves check. That is a model and runner change, and no owner needs non-blocking checks yet.

**Revisit when:** an owner needs a check that informs the respondent without stopping the move.
