import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import type { MathExpressionScalarCompute } from "#src/models/function/MathExpressionScalarCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

export const createSignature = (
  parameters: MathExpressionParameterType[],
  minArity: number,
  maxArity: number,
  compute: MathExpressionSignature["compute"],
  scalarCompute: MathExpressionScalarCompute = {},
): MathExpressionSignature => ({ compute, maxArity, minArity, parameters, ...scalarCompute });
