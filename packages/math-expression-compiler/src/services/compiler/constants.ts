import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";

// The empty values and locals a constant subtree is computed with, which read no variable and no assignment
export const NO_VALUES: readonly number[] = [];
export const NO_LOCALS: MathExpressionResult[] = [];
