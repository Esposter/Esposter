import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

// The numbers a call's values hold, where a list of numbers stands for its numbers
export const toMathExpressionNumbers = (values: readonly MathExpressionValue[]): number[] => values.flat();
