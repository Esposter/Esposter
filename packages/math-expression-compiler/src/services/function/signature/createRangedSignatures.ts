import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionScalarCompute } from "#src/models/function/MathExpressionScalarCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

export const createRangedSignatures = (
  minArity: number,
  maxArity: number,
  compute: MathExpressionNumberCompute,
  scalarCompute?: MathExpressionScalarCompute,
): MathExpressionSignature[] => [createNumberSignature(minArity, maxArity, compute, scalarCompute)];
