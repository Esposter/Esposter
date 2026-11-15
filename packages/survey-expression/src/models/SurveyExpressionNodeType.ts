// Each member's value is the `type` a node of the parsed tree carries
export const SurveyExpressionNodeType = {
  Binary: "binary",
  Call: "call",
  List: "list",
  Literal: "literal",
  Reference: "reference",
  Unary: "unary",
} as const;
export type SurveyExpressionNodeType = (typeof SurveyExpressionNodeType)[keyof typeof SurveyExpressionNodeType];
