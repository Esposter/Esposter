# Matrix Column Totals

SurveyJS shows a total under each column of a matrix question. This record covers that displayed total.

## Why deferred

The matrix kinds hold no total prop, and no column aggregation runs over a matrix's answers. A matrix's answer is a record from each row to a column's value ([survey runner design](../../../specs/resource/survey-runner/design.md)), so a total would need a sum per column in the runner and a place to display it. No owner has asked for displayed totals.

**Revisit when:** an owner needs a matrix's column totals shown to the respondent.
