import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import type { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";

// An operator on one operand: a prefix one such as `not` before it, or a postfix one such as `empty` after it
export interface SurveyExpressionUnaryNode {
  operand: SurveyExpressionNode;
  operator: SurveyExpressionUnaryOperator;
  position: number;
  type: SurveyExpressionNodeType.Unary;
}
