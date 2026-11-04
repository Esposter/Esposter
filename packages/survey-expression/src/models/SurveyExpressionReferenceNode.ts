import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// A question's answer, read by the name between its braces, which may hold dots and spaces
export interface SurveyExpressionReferenceNode {
  name: string;
  position: number;
  type: SurveyExpressionNodeType.Reference;
}
