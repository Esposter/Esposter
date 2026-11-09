# Dynamic Text Piping

SurveyJS pipes an answer into a title, a description or a choice text, so a question can name what a respondent picked earlier. This record covers that substitution.

## Why deferred

Titles and choice texts render as stored, and no text substitution runs in them (`apps/web/app/components/Resource/Survey/Runner.vue`). The expression language returns values to checks and calculated values, not to a title. A piped text needs the language to hand text-valued reads to the runner, and the titles to take them. The [inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md) defers it until that expression-language change comes first.

**Revisit when:** the expression language gains text-valued reads.
