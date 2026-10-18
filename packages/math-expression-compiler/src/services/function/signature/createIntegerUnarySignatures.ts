import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createUnarySignatures } from "#src/services/function/signature/createUnarySignatures";

export const createIntegerUnarySignatures = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  createUnarySignatures((value) => (Number.isInteger(value) ? compute(value) : null));
