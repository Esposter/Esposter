import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createFixedSignatures } from "#src/services/function/signature/createFixedSignatures";

export const createUnarySignatures = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  createFixedSignatures(1, (values) => compute(values[0] ?? Number.NaN));
