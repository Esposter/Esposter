import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { createListPairCompute } from "#src/services/function/signature/createListPairCompute";
import { createSignature } from "#src/services/function/signature/createSignature";

// A pair of lists, or a list and a number, where the number is read as a list of one
export const createOrderedListSignatures = (
  compute: (left: number[], right: number[]) => null | number,
): MathExpressionSignature[] => {
  const computePair = createListPairCompute(compute);

  return [
    [MathExpressionParameterType.Number, MathExpressionParameterType.List],
    [MathExpressionParameterType.List, MathExpressionParameterType.Number],
    [MathExpressionParameterType.List, MathExpressionParameterType.List],
  ].map((parameters) => createSignature(parameters, 2, 2, computePair));
};
