import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";
import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

// A variadic function may take its scalar form of two numbers, which an operator or a call of two arguments computes with
export const createVariadicSignatures = (
  minArity: number,
  compute: MathExpressionNumberCompute,
  computeBinary?: MathExpressionBinaryCompute,
): MathExpressionSignature[] => [createNumberSignature(minArity, Number.POSITIVE_INFINITY, compute, { computeBinary })];
