# Keep SurveyJS and Type Its Document

## Why not

The option kept SurveyJS as the runner and the Creator, and made the survey's JSON a typed document checked on every save. It was the first recommendation of the survey form engine change, and it was rejected by the owner for three reasons.

- **The owner ruled out a third-party engine for the survey.** Typing the document fixes what an agent can write, but the runner and the Creator would stay SurveyJS's, and the owner's decision is that the survey depends on no third-party engine.
- **The Creator is commercially licensed.** SurveyJS's Creator is free to use only under an open-source exception, and the planned paid storage tiers would end that exception. Keeping it means buying a licence or replacing it, so the replacement is taken now rather than when the exception ends.
- **The typed check does not reach the rest of the problem.** A schema on save covers the document's structure, not the runner's behaviour or the Creator's editing, which are where SurveyJS's weight and its theme sit.

The replacement is recorded in `resource-survey-form-engine`, which removes SurveyJS and the survey data it stored in the same change.
