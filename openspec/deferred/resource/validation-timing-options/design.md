# Validation Timing Options

SurveyJS checks an answer as it changes, and can hold every check until the survey ends. This record covers both timing options.

## Why deferred

The runner has one timing. Each move checks its page, and completion checks every shown page in order ([survey runner design](../../../specs/resource/survey-runner/design.md)). An immediate check on each change, and a check held to the end of the survey, are two more timings on that one path. Each would need a survey setting to choose it, and the runner's checks would have to run at a different moment for each.

**Revisit when:** an owner needs checks as the answer is typed, or needs a survey's checks held until its last page.
