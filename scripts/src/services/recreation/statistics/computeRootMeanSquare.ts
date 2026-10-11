// The root-mean-square of the values that are finite, a sample not taken being NaN
export const computeRootMeanSquare = (values: Iterable<number>): number => {
  let sum = 0;
  let count = 0;
  for (const value of values)
    if (Number.isFinite(value)) {
      sum += value ** 2;
      count++;
    }
  return Math.sqrt(sum / count);
};
