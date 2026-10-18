import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";

import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";

// An operator's two-number function is the scalar form of its first signature, else that signature's array form, and
// Null for a name the table does not hold
export const getMathExpressionBinaryCompute = (name: string): MathExpressionBinaryCompute => {
  const signature = getMathExpressionSignatures(name)?.[0];
  if (signature === undefined) return () => null;
  if (signature.computeBinary !== undefined) return signature.computeBinary;

  return (left, right) => signature.compute([left, right]);
};
