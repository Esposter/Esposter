import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

export const createVariadicSignatures = (
  minArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature[] => [createNumberSignature(minArity, Number.POSITIVE_INFINITY, compute)];
