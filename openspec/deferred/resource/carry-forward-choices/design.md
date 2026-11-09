# Carry-Forward Choices

SurveyJS takes a question's choices from an earlier answer, so a later question offers only the options a respondent picked before. This record covers carrying an earlier answer's choices forward.

## Why deferred

A question's choices are a list the question stores, and the runner orders that list ([survey runner design](../../../specs/resource/survey-runner/design.md)). Choices taken from an earlier answer need a choice-source model that the document does not hold, and the runner would have to read another answer's pick into a list. That model is a design of its own.

**Revisit when:** an owner needs a later question's options to follow an earlier answer.
