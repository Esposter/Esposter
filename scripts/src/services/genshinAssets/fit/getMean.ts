// The mean of a grid's finite values, which its statistics are taken about, so an offset the residual keeps is not read as
// Its roughness
export const getMean = (values: Float64Array): number => {
  let sum = 0;
  let count = 0;
  for (const value of values)
    if (Number.isFinite(value)) {
      sum += value;
      count++;
    }
  return sum / count;
};
