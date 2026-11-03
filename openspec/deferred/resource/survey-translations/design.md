# Survey Translations

SurveyJS lets an owner translate every string of a survey into other languages in a Translation tab, and a respondent sees the language of their browser. The [survey form engine](../../../changes/resource-survey-form-engine-program/design.md) stores each string as a single text, so a survey is in one language.

## Why deferred

Translations touch every string a survey holds: titles, descriptions, choices, validator messages and the completion message. Each would become a map from language to text, which changes the document schema, the property grid's every text field, the runner and the summary's labels. No owner has asked for it, and the stored surveys are deleted, so the cost would be paid for a use nobody has shown.

**Revisit when:** an owner asks to run one survey in two languages, or the game text work gives the app a language picker whose strings a survey should follow.
