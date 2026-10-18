import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionScalarCompute } from "#src/models/function/MathExpressionScalarCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

export const createFixedSignatures = (
  arity: number,
  compute: MathExpressionNumberCompute,
  scalarCompute?: MathExpressionScalarCompute,
): MathExpressionSignature[] => [createNumberSignature(arity, arity, compute, scalarCompute)];
