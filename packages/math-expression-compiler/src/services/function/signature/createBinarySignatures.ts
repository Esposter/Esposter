import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createRangedSignatures } from "#src/services/function/signature/createRangedSignatures";

export const createBinarySignatures = (compute: MathExpressionBinaryCompute): MathExpressionSignature[] =>
  createRangedSignatures(2, 2, (values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN), {
    computeBinary: compute,
  });
