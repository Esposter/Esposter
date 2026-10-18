import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

// A list argument leads a function's arguments, and the numbers after it follow the list, as mathjs takes them
export const createListFirstCompute =
  (compute: (list: number[], numbers: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(values.slice(0, 1).flat(), values.slice(1).flat());
