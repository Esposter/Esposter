// Each member's value is the `type` a node of the parsed tree carries
export const MathExpressionNodeType = {
  Assignment: "assignment",
  Binary: "binary",
  Call: "call",
  Comparison: "comparison",
  Conditional: "conditional",
  Group: "group",
  List: "list",
  Logical: "logical",
  Name: "name",
  Number: "number",
  Percentage: "percentage",
  Unary: "unary",
} as const;
export type MathExpressionNodeType = (typeof MathExpressionNodeType)[keyof typeof MathExpressionNodeType];
