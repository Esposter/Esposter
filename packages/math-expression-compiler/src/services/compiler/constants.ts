import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";

// The empty values and locals a constant subtree is computed with, which read no variable and no assignment
export const NO_VALUES: readonly number[] = [];
export const NO_LOCALS: MathExpressionResult[] = [];
// The operator names that add or subtract, where a percentage on the right side is a rate of the left side
export const ADDITIVE_NAMES: readonly string[] = ["add", "subtract"];
