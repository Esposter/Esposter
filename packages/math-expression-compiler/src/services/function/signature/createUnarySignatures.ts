import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";
import type { MathExpressionUnaryCompute } from "#src/models/function/MathExpressionUnaryCompute";

import { createRangedSignatures } from "#src/services/function/signature/createRangedSignatures";

export const createUnarySignatures = (compute: MathExpressionUnaryCompute): MathExpressionSignature[] =>
  createRangedSignatures(1, 1, (values) => compute(values[0] ?? Number.NaN), { computeUnary: compute });
