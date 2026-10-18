import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { getMathExpressionArityMessage } from "#src/services/parser/getMathExpressionArityMessage";

// A call no signature takes is an arity error when no signature has its count of arguments, else a list in the wrong place
export const getMathExpressionSignatureError = (
  name: string,
  signatures: readonly MathExpressionSignature[],
  parameterTypes: MathExpressionParameterType[],
): string => {
  const count = parameterTypes.length;
  const fitting = signatures.filter((signature) => count >= signature.minArity && count <= signature.maxArity);
  if (fitting.length === 0)
    return getMathExpressionArityMessage(
      name,
      Math.min(...signatures.map((signature) => signature.minArity)),
      Math.max(...signatures.map((signature) => signature.maxArity)),
    );
  if (parameterTypes.includes(MathExpressionParameterType.List)) return `"${name}" does not take a list argument`;
  return `"${name}" takes a list argument`;
};
