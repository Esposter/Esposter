import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { createListPairCompute } from "#src/services/function/signature/createListPairCompute";
import { createListPairSignature } from "#src/services/function/signature/createListPairSignature";
import { createSignature } from "#src/services/function/signature/createSignature";

// A pair of lists, or a list and a number, where the number is read as a list of one
export const createOrderedListSignatures = (
  compute: (left: number[], right: number[]) => null | number,
): MathExpressionSignature[] => [
  createSignature(
    [MathExpressionParameterType.Number, MathExpressionParameterType.List],
    2,
    2,
    createListPairCompute(compute),
  ),
  createSignature(
    [MathExpressionParameterType.List, MathExpressionParameterType.Number],
    2,
    2,
    createListPairCompute(compute),
  ),
  createListPairSignature(compute),
];
