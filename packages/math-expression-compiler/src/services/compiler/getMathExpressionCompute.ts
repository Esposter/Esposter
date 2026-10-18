import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";

// An operator's function takes one signature, the first of its table entry, which a call matches by its arguments
export const getMathExpressionCompute = (name: string): MathExpressionSignature["compute"] =>
  getMathExpressionSignatures(name)?.[0]?.compute ?? (() => null);
