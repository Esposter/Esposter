# Logic Map

SurveyJS shows its survey's logic as a map across the whole survey, so an author sees each jump and condition between elements at once. This record covers that map.

## Why deferred

The decision on logic keeps each condition with the element it edits, and the Logic tab shows one element's rows ([survey layout design](../../../specs/resource/survey-layout/design.md)). A map of the jumps across the survey asks a different question, and the layout design leaves it for later. A map of jumps also needs jumps to draw, and the survey has none until the [logic actions](../logic-actions/design.md) exist.

**Revisit when:** a map surface is designed for survey logic, which the survey layout design leaves for later.
