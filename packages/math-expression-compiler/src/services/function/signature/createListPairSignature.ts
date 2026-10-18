import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { createListPairCompute } from "#src/services/function/signature/createListPairCompute";
import { createSignature } from "#src/services/function/signature/createSignature";

export const createListPairSignature = (
  compute: (left: number[], right: number[]) => null | number,
): MathExpressionSignature =>
  createSignature(
    [MathExpressionParameterType.List, MathExpressionParameterType.List],
    2,
    2,
    createListPairCompute(compute),
  );
