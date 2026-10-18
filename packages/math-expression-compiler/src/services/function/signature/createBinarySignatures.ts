import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createFixedSignatures } from "#src/services/function/signature/createFixedSignatures";

export const createBinarySignatures = (compute: MathExpressionBinaryCompute): MathExpressionSignature[] =>
  createFixedSignatures(2, (values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN), {
    computeBinary: compute,
  });
