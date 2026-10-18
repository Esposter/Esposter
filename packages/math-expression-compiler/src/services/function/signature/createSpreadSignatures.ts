import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createListSignature } from "#src/services/function/signature/createListSignature";
import { createNumberSignature } from "#src/services/function/signature/createNumberSignature";

// A spread function also takes one list, whose numbers are its arguments
export const createSpreadSignatures = (
  minArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature[] => [
  createNumberSignature(minArity, Number.POSITIVE_INFINITY, compute),
  createListSignature(compute),
];
