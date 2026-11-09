# NoneOf Operator

SurveyJS has a `noneof` operator that holds when none of an answer's values is in a list. This record covers that operator.

## Why not

The expression language has a fixed set of operators, and each has one spelling ([survey expression design](../../../specs/resource/survey-expression/design.md), R6). `noneof` is not in that set. The same answer comes from `not` over `anyof`, which the language already has, so a survey's check reads `not` beside `anyof` rather than a second operator.
