import type { MathExpressionSignature } from "#src/models/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/MathExpressionParameterType";

// The kind of the parameter at an index, where the last parameter type repeats for every index past the list
const getParameterType = (signature: MathExpressionSignature, index: number): MathExpressionParameterType | undefined =>
  signature.parameters[Math.min(index, signature.parameters.length - 1)];

const checkIsMatchingKind = (
  parameterType: MathExpressionParameterType | undefined,
  argumentType: MathExpressionParameterType,
): boolean => parameterType === MathExpressionParameterType.Any || parameterType === argumentType;

const checkIsMatching = (signature: MathExpressionSignature, parameterTypes: MathExpressionParameterType[]): boolean =>
  parameterTypes.length >= signature.minArity &&
  parameterTypes.length <= signature.maxArity &&
  parameterTypes.every((parameterType, index) =>
    checkIsMatchingKind(getParameterType(signature, index), parameterType),
  );

// The first signature a call's argument kinds fit, which the parser checks a call with and the compiler computes it with
export const matchMathExpressionSignature = (
  signatures: readonly MathExpressionSignature[],
  parameterTypes: MathExpressionParameterType[],
): MathExpressionSignature | undefined => signatures.find((signature) => checkIsMatching(signature, parameterTypes));
