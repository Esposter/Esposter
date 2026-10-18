// The left operands that decide a bitwise and or or: zero for and, and minus one for or
export const MathExpressionBitwiseAbsorptionMap: Readonly<Record<string, { absorbs: number; result: number }>> = {
  bitAnd: { absorbs: 0, result: 0 },
  bitOr: { absorbs: -1, result: -1 },
};
