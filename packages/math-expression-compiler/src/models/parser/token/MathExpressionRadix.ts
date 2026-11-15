export const MathExpressionRadix = { Binary: "b", Hexadecimal: "x", Octal: "o" } as const;
export type MathExpressionRadix = (typeof MathExpressionRadix)[keyof typeof MathExpressionRadix];
