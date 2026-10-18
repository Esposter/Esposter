import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";
import type { MathExpressionUnaryCompute } from "#src/models/function/MathExpressionUnaryCompute";

import { createFixedSignatures } from "#src/services/function/signature/createFixedSignatures";

export const createUnarySignatures = (compute: MathExpressionUnaryCompute): MathExpressionSignature[] =>
  createFixedSignatures(1, (values) => compute(values[0] ?? Number.NaN), { computeUnary: compute });
