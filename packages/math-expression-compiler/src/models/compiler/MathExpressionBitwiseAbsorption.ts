export const MathExpressionBitwiseAbsorption = { BitAnd: "bitAnd", BitOr: "bitOr" } as const;
export type MathExpressionBitwiseAbsorption =
  (typeof MathExpressionBitwiseAbsorption)[keyof typeof MathExpressionBitwiseAbsorption];
