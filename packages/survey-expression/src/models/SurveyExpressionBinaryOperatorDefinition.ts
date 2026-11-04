import type { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";

// A binary operator's place in the grammar. The higher power binds tighter. A chain of one operator groups to the left,
// Unless the operator is right-associative, so a chain of `^` groups to the right
export interface SurveyExpressionBinaryOperatorDefinition {
  operator: SurveyExpressionBinaryOperator;
  power: number;
  rightAssociative?: true;
}
