import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createBinarySignatures } from "#src/services/function/signature/createBinarySignatures";

export const createIntegerBinarySignatures = (
  compute: (left: number, right: number) => null | number,
): MathExpressionSignature[] =>
  createBinarySignatures((left, right) =>
    Number.isInteger(left) && Number.isInteger(right) ? compute(left, right) : null,
  );
