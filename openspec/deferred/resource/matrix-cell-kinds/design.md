# Matrix Cell Kinds

SurveyJS's dynamic matrix takes a radio group and an expression as cell types, beside text, comment, dropdown, checkbox, boolean and rating. This record covers those two cell kinds.

## Why deferred

The runner checks a dynamic matrix's cells as six kinds ([survey runner design](../../../specs/resource/survey-runner/design.md)). A radio group cell needs an editor and a check of its own. An expression cell reads each row's own answers, so it needs a per-row design first.

**Revisit when:** an owner needs a radio group or an expression in a dynamic matrix's cells.
