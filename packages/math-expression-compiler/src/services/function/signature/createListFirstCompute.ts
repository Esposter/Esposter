import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

// The first argument leads a function's arguments, read as a list whether it is a list or one number, and the arguments
// After it follow as one list of numbers, as mathjs takes them
export const createListFirstCompute =
  (compute: (list: number[], numbers: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(values.slice(0, 1).flat(), values.slice(1).flat());
