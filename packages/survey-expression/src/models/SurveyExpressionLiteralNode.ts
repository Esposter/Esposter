import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// A number, a string or a boolean written in the expression
export interface SurveyExpressionLiteralNode {
  position: number;
  type: typeof SurveyExpressionNodeType.Literal;
  value: boolean | number | string;
}
