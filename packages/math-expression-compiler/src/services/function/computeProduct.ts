import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

import { computeDotProduct } from "#src/services/function/computeDotProduct";

const scaleList = (list: number[], scalar: number): number[] => list.map((element) => element * scalar);
// The product of two operands, where a number scales a list and two lists give their dot product, as mathjs multiplies them
const multiplyPair = (left: MathExpressionValue, right: MathExpressionValue): MathExpressionValue | null => {
  if (typeof left === "number" && typeof right === "number") return left * right;
  if (typeof left === "number" && Array.isArray(right)) return scaleList(right, left);
  if (Array.isArray(left) && typeof right === "number") return scaleList(left, right);
  if (Array.isArray(left) && Array.isArray(right)) return computeDotProduct(left, right);
  return null;
};
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
