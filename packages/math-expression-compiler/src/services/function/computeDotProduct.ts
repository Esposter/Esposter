// The sum of the products of two vectors' elements, which mathjs takes only of vectors of one length
export const computeDotProduct = (left: readonly number[], right: readonly number[]): null | number => {
  if (left.length !== right.length) return null;
  return left.reduce((total, value, index) => total + value * (right[index] ?? Number.NaN), 0);
};
