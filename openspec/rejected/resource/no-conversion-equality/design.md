# No-Conversion Equality

SurveyJS has a `#` operator that compares two values without converting their types. This record covers that operator.

## Why not

The expression language keeps one equality grammar, and types each comparison by its own rule ([survey expression design](../../../specs/resource/survey-expression/design.md), R6 and R7). Two values that read as numbers compare as numbers, a boolean equals only the same boolean, and two identical texts are equal. Equality over typed answers already does the job, so `=` is the one comparison.
