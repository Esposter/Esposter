// The kinds of token the tokenizer reads, where a named word such as `mod` is a delimiter rather than a name
export const MathExpressionTokenType = {
  Delimiter: "delimiter",
  Null: "null",
  Number: "number",
  Symbol: "symbol",
  Unknown: "unknown",
} as const;
export type MathExpressionTokenType = (typeof MathExpressionTokenType)[keyof typeof MathExpressionTokenType];
