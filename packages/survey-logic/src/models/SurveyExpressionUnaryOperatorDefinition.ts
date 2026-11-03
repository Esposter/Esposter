import type { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";

// A prefix operator's operand takes every operator at least this tight. A postfix operator binds as a binary operator
// Of the same power would, so it applies to the expression before it only where that binary operator would
export interface SurveyExpressionUnaryOperatorDefinition {
  operator: SurveyExpressionUnaryOperator;
  power: number;
}
