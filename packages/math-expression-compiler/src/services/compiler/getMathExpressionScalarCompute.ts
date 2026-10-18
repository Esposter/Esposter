import type { MathExpressionScalarCompute } from "#src/models/function/MathExpressionScalarCompute";

import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";

// An operator's scalar function of the form Key names: the first signature's own form when it carries one, else its array form over the same operands, and Null for a name the table does not hold
export const getMathExpressionScalarCompute = <Key extends keyof MathExpressionScalarCompute>(
  name: string,
  key: Key,
): NonNullable<MathExpressionScalarCompute[Key]> => {
  const signature = getMathExpressionSignatures(name)?.[0];
  if (signature === undefined) return () => null;
  const scalarCompute = signature[key];
  if (scalarCompute !== undefined) return scalarCompute;

  return (...values: number[]) => signature.compute(values);
};
