import type { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";

// A binary operator's place in the grammar. The higher power binds tighter, and a right-associative operator takes its
// Own power for its right operand, so a chain of it nests to the right
export interface SurveyExpressionBinaryOperatorDefinition {
  operator: SurveyExpressionBinaryOperator;
  power: number;
  rightAssociative?: boolean;
}
