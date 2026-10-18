import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";

// A statistic of a list is undefined for an empty one, where mathjs throws
export const createNonEmptyCompute =
  (compute: (values: readonly number[]) => number): MathExpressionNumberCompute =>
  (values) =>
    values.length === 0 ? null : compute(values);
