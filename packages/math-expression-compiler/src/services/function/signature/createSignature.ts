import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";

export const createSignature = (
  parameters: MathExpressionParameterType[],
  minArity: number,
  maxArity: number,
  compute: MathExpressionSignature["compute"],
): MathExpressionSignature => ({ compute, maxArity, minArity, parameters });
