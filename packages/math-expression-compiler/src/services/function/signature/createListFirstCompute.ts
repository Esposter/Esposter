import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { toMathExpressionNumbers } from "#src/services/function/toMathExpressionNumbers";

// A list argument leads a function's arguments, and the numbers after it follow the list, as mathjs takes them
export const createListFirstCompute =
  (compute: (list: number[], numbers: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toMathExpressionNumbers(values.slice(0, 1)), toMathExpressionNumbers(values.slice(1)));
