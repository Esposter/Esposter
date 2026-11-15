// The operators that read their right side only when their left side does not decide them
export const MathExpressionLogicalOperator = { And: "and", Nullish: "nullish", Or: "or" } as const;
export type MathExpressionLogicalOperator =
  (typeof MathExpressionLogicalOperator)[keyof typeof MathExpressionLogicalOperator];
