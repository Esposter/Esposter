import type { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// An operator between its two operands
export interface SurveyExpressionBinaryNode {
  left: SurveyExpressionNode;
  operator: SurveyExpressionBinaryOperator;
  position: number;
  right: SurveyExpressionNode;
  type: SurveyExpressionNodeType.Binary;
}
