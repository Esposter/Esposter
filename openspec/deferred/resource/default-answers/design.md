# Default Answers

SurveyJS sets a default answer on a question, and prefills a respondent's answers from the link they open. This record covers both, the default value and the URL prefill.

## Why deferred

No question kind holds a default prop, and each kind's form draws only the props its schema holds ([survey properties design](../../../specs/resource/survey-properties/design.md)). A default is an engine model change, since each kind's answer has its own type and a default would be typed for each. A URL prefill would also add a public read of the link's values, where the survey page reads the URL only for its participant token (`apps/web/app/components/Resource/Survey/View.vue`).

**Revisit when:** a shared default-value design exists, and an owner needs a question to start with a value or a link to prefill answers.
