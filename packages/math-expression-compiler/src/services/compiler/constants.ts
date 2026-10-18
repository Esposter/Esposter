import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";

// The empty values and locals a constant subtree is computed with, which read no variable and no assignment
export const NO_VALUES: readonly number[] = [];
export const NO_LOCALS: MathExpressionResult[] = [];
// The left operands that decide a bitwise and or or: zero for and, and minus one for or
export const BITWISE_ABSORPTIONS: Readonly<Record<string, { absorbs: number; result: number }>> = {
  bitAnd: { absorbs: 0, result: 0 },
  bitOr: { absorbs: -1, result: -1 },
};
