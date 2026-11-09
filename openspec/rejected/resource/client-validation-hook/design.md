# Client Validation Hook

SurveyJS lets a developer write a custom client-side validation function, which runs in the page a respondent sees. This record covers that developer hook.

## Why not

An owner writes a survey's checks as expressions, and the runner's page check runs the required test, the answer's schema and each validator's expression ([survey runner design](../../../specs/resource/survey-runner/design.md)). A developer hook would run code the owner did not write inside the public page, for every survey that used it. The expression validators cover the checks an owner needs. The page and the server call the same functions, so a hook would also have to run on the server to agree with the page.
