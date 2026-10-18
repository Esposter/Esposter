import type { MathExpressionUnaryCompute } from "#src/models/function/MathExpressionUnaryCompute";

import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";

// An operator's one-number function is the scalar form of its first signature, else that signature's array form, and
// Null for a name the table does not hold
export const getMathExpressionUnaryCompute = (name: string): MathExpressionUnaryCompute => {
  const signature = getMathExpressionSignatures(name)?.[0];
  if (signature === undefined) return () => null;
  if (signature.computeUnary !== undefined) return signature.computeUnary;

  return (value) => signature.compute([value]);
};
