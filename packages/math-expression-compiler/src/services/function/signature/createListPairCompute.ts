import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { toMathExpressionNumbers } from "#src/services/function/toMathExpressionNumbers";

// A function of two lists takes each argument as the list of its numbers, a number standing for a list of one
export const createListPairCompute =
  (compute: (left: number[], right: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toMathExpressionNumbers(values.slice(0, 1)), toMathExpressionNumbers(values.slice(1, 2)));
