import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { toMathExpressionNumbers } from "#src/services/function/toMathExpressionNumbers";

// A number leads a function's arguments and a list follows it
export const createNumberFirstCompute =
  (compute: (value: number, list: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toMathExpressionNumbers(values.slice(0, 1))[0] ?? Number.NaN, toMathExpressionNumbers(values.slice(1)));
