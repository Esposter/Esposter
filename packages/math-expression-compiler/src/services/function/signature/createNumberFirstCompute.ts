import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

// A number leads a function's arguments and a list follows it
export const createNumberFirstCompute =
  (compute: (value: number, list: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(values.slice(0, 1).flat()[0] ?? Number.NaN, values.slice(1).flat());
