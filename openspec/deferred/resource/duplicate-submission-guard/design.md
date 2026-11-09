# Duplicate Submission Guard

SurveyJS stops a respondent from submitting the same survey twice from one browser, with a cookie. This record covers that guard.

## Why deferred

An anonymous response carries no identity, since its participant token is stripped to empty ([survey response modes design](../../../specs/resource/survey-response-modes/design.md)). A cookie guard has no respondent to key it to. The submission path is rate-limited per address instead, which bounds a flood of responses without tying them to a browser ([survey resource design](../../../specs/resource/survey-resource/design.md)).

**Revisit when:** repeat submissions outrun the address rate limit.
