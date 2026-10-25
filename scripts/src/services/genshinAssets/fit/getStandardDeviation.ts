import { getMean } from "#src/services/genshinAssets/fit/getMean";

export const getStandardDeviation = (values: Float64Array): number => {
  const mean = getMean(values);
  let sum = 0;
  let count = 0;
  for (const value of values)
    if (Number.isFinite(value)) {
      sum += (value - mean) ** 2;
      count++;
    }
  return Math.sqrt(sum / count);
};
