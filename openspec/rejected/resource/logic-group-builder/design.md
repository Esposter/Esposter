# Logic Group Builder

SurveyJS joins an element's conditions with AND or OR, and nests groups of them with parentheses. This record covers that connective between conditions and the grouping that mixes the two.

## Why not

The logic builder's rows form one flat run joined by a single connective, `and` or `or`. A group in parentheses, or a connective nested inside another, is a custom expression the builder does not draw ([survey logic builder design](../../../specs/resource/survey-logic-builder/design.md)). The design rejects a nested group builder, since it would double the component for expressions a survey owner rarely writes. The Logic tab's typed expression field already holds any mix of the two, with its error and position.
