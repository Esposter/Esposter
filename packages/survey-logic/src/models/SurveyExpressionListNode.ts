import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// A bracketed list, each item an expression of its own
export interface SurveyExpressionListNode {
  items: SurveyExpressionNode[];
  position: number;
  type: SurveyExpressionNodeType.List;
}
