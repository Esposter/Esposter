# Dynamic Text Piping

SurveyJS pipes an answer into a title, a description or a choice text, so a question can name what a respondent picked earlier. This record covers that substitution.

## Why deferred

Titles and choice texts render as stored, and no text substitution runs in them (`apps/web/app/components/Resource/Survey/Runner.vue`). The expression language reads and returns text, since it has text functions, but it hands its values to checks and calculated values, not to a title. A piped text needs the runner to substitute a read into a title, a description or a choice text, and those to take it. The [inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md) defers it until that expression-language change comes first.

**Revisit when:** an owner asks to name an earlier answer in a later title, and a calculated value in the text does not do.
