import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

import { computeDotProduct } from "#src/services/function/computeDotProduct";
import { scaleList } from "#src/services/function/scaleList";

// The product of two operands, where a number scales a list and two lists give their dot product, as mathjs multiplies them
export const multiplyPair = (left: MathExpressionValue, right: MathExpressionValue): MathExpressionValue | null => {
  if (typeof left === "number" && typeof right === "number") return left * right;
  if (typeof left === "number" && Array.isArray(right)) return scaleList(right, left);
  if (Array.isArray(left) && typeof right === "number") return scaleList(left, right);
  if (Array.isArray(left) && Array.isArray(right)) return computeDotProduct(left, right);
  return null;
};
