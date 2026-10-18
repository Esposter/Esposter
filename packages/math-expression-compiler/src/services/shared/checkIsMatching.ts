import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { checkIsMatchingKind } from "#src/services/shared/checkIsMatchingKind";
import { getParameterType } from "#src/services/shared/getParameterType";

export const checkIsMatching = (
  signature: MathExpressionSignature,
  parameterTypes: MathExpressionParameterType[],
): boolean =>
  parameterTypes.length >= signature.minArity &&
  parameterTypes.length <= signature.maxArity &&
  parameterTypes.every((parameterType, index) =>
    checkIsMatchingKind(getParameterType(signature, index), parameterType),
  );
