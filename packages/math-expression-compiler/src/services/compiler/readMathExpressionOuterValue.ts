import type { MathExpressionOuterBinding } from "#src/models/compiler/MathExpressionOuterBinding";
import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";

// Reads the value an assigned name holds before its assignment runs: its variable, else its constant, else nothing
export const readMathExpressionOuterValue = (
  outer: MathExpressionOuterBinding,
  values: readonly number[],
): MathExpressionResult => {
  if (outer.variableIndex !== undefined) return values[outer.variableIndex] ?? Number.NaN;
  return outer.constant ?? null;
};
