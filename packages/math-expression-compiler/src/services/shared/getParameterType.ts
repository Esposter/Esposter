import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

// The kind of the parameter at an index, where the last parameter type repeats for every index past the list
export const getParameterType = (
  signature: MathExpressionSignature,
  index: number,
): MathExpressionParameterType | undefined => signature.parameters[Math.min(index, signature.parameters.length - 1)];
