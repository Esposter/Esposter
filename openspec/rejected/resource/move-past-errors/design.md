# Move Past Pages With Errors

SurveyJS can let a respondent move on from a page that holds validation errors, and check the errors later. This record covers that option.

## Why not

The runner refuses to move past a page while a visible required question on it is unanswered, and names the first one for focus ([survey runner spec](../../../specs/resource/survey-runner/spec.md)). Its move function returns the blocking errors in place of the next page ([survey runner design](../../../specs/resource/survey-runner/design.md)). The server refuses a submit that leaves a required question empty ([survey respondent spec](../../../specs/resource/survey-respondent/spec.md)), so a respondent who moved past an error would reach a completion the server refuses.
