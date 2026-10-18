import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { createListSignature } from "#src/services/function/signature/createListSignature";
import { createVariadicSignatures } from "#src/services/function/signature/createVariadicSignatures";

// A spread function also takes one list, whose numbers are its arguments
export const createSpreadSignatures = (
  minArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature[] => [...createVariadicSignatures(minArity, compute), createListSignature(compute)];
