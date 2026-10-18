import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

import { multiplyPair } from "#src/services/function/multiplyPair";

// The product of a call's operands, folded from the left, so a list's product is a number only once two lists meet.
// A product that stays a list is not a number, and the call answers no number for it
export const computeProduct = (values: readonly MathExpressionValue[]): null | number => {
  let total: MathExpressionValue | null = 1;
  for (const value of values) {
    if (total === null) return null;
    total = multiplyPair(total, value);
  }
  return typeof total === "number" ? total : null;
};
