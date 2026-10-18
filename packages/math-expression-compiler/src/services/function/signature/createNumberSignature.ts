import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { createNumericCompute } from "#src/services/function/signature/createNumericCompute";
import { createSignature } from "#src/services/function/signature/createSignature";

export const createNumberSignature = (
  minArity: number,
  maxArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature =>
  createSignature([MathExpressionParameterType.Number], minArity, maxArity, createNumericCompute(compute));
