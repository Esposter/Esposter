import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

export const createFixedSignatures = (
  arity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature[] => [createNumberSignature(arity, arity, compute)];
