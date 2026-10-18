import { computeSum } from "#src/services/function/computeSum";

// The Pearson correlation of two lists, by the sums that mathjs takes, in its order, so the rounding is the same
export const computeCorrelation = (left: readonly number[], right: readonly number[]): null | number => {
  if (left.length !== right.length) return null;

  const count = left.length;
  const sumLeft = computeSum(left);
  const sumRight = computeSum(right);
  const sumProducts = left.reduce((total, value, index) => total + value * (right[index] ?? Number.NaN), 0);
  const sumLeftSquares = computeSum(left.map((value) => value ** 2));
  const sumRightSquares = computeSum(right.map((value) => value ** 2));
  const numerator = count * sumProducts - sumLeft * sumRight;
  const denominator = Math.sqrt((count * sumLeftSquares - sumLeft ** 2) * (count * sumRightSquares - sumRight ** 2));
  return numerator / denominator;
};
