# Survey Dropdown Matrix

SurveyJS has a dropdown matrix: a matrix with a fixed set of rows whose cells are typed columns. The [survey form engine](../../../changes/resource-survey-form-engine-program/design.md) builds the dynamic matrix, whose rows a respondent adds, and the single-choice matrix.

## Why deferred

The dynamic matrix already holds typed columns, so a dropdown matrix is that matrix with its rows fixed by the owner. It would share the dynamic matrix's cell editors, so it is cheapest to add once those are built and an owner asks for fixed rows.

**Revisit when:** an owner needs a matrix with fixed rows and typed cells, which the single-choice matrix and the dynamic matrix cannot give.
