import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createSingletonListSignature } from "#src/services/function/signature/createSingletonListSignature";
import { createUnarySignatures } from "#src/services/function/signature/createUnarySignatures";

// A function that is the identity on a number, which takes a list of one number as its number
export const createIdentitySignatures = (): MathExpressionSignature[] => [
  ...createUnarySignatures((value) => value),
  createSingletonListSignature((value) => value),
];
