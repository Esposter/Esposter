# Keep SurveyJS and Type Its Document

## Why not

The option kept SurveyJS as the runner and the Creator, and made the survey's JSON a typed document checked on every save. It was the first recommendation of the survey form engine change, and the owner rejected it for two reasons.

- **The owner ruled out a third-party engine for the survey.** Typing the document fixes what an agent can write, but the runner and the Creator would stay SurveyJS's, and the owner's decision is that the survey depends on no third-party engine.
- **The typed check does not reach the rest of the problem.** A schema on save covers the document's structure, not the runner's behaviour or the Creator's editing, which are where SurveyJS's weight and its theme sit.

The replacement is recorded in `2026-11-04-resource-survey-form-engine-program`, which removed SurveyJS and the survey data it stored in the same change.
