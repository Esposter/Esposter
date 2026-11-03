import type { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";

// A binary operator's place in the grammar. The higher power binds tighter, and every operator is left-associative, so a
// Chain of one groups to the left, as SurveyJS groups a chain of `^`
export interface SurveyExpressionBinaryOperatorDefinition {
  operator: SurveyExpressionBinaryOperator;
  power: number;
}
