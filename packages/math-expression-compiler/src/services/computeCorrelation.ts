const sumOf = (values: number[]): number => values.reduce((total, value) => total + value, 0);

// The Pearson correlation of two lists, by the sums that mathjs takes, in its order, so the rounding is the same
export const computeCorrelation = (left: number[], right: number[]): null | number => {
  if (left.length !== right.length) return null;

  const count = left.length;
  const sumLeft = sumOf(left);
  const sumRight = sumOf(right);
  const sumProducts = left.reduce((total, value, index) => total + value * (right[index] ?? Number.NaN), 0);
  const sumLeftSquares = sumOf(left.map((value) => value ** 2));
  const sumRightSquares = sumOf(right.map((value) => value ** 2));
  const numerator = count * sumProducts - sumLeft * sumRight;
  const denominator = Math.sqrt((count * sumLeftSquares - sumLeft ** 2) * (count * sumRightSquares - sumRight ** 2));
  return numerator / denominator;
};
