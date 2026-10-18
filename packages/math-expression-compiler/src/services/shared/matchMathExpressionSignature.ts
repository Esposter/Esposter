import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { checkIsMatching } from "#src/services/shared/checkIsMatching";

// The first signature a call's argument kinds fit, which the parser checks a call with and the compiler computes it with
export const matchMathExpressionSignature = (
  signatures: readonly MathExpressionSignature[],
  parameterTypes: MathExpressionParameterType[],
): MathExpressionSignature | undefined => signatures.find((signature) => checkIsMatching(signature, parameterTypes));
