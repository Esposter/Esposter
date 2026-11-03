import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// A number, a string or a boolean written in the expression
export interface SurveyExpressionLiteralNode {
  position: number;
  type: SurveyExpressionNodeType.Literal;
  value: boolean | number | string;
}
