import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createFixedSignatures } from "#src/services/function/signature/createFixedSignatures";

export const createBinarySignatures = (
  compute: (left: number, right: number) => null | number,
): MathExpressionSignature[] =>
  createFixedSignatures(2, (values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN));
