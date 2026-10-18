import { computeMean } from "#src/services/function/computeMean";
import { computeSum } from "#src/services/function/computeSum";

export const computeVariance = (values: readonly number[]): number => {
  // A single value has no spread, unless it is infinite, where its mean is not a number, as mathjs answers
  if (values.length === 1) return Number.isFinite(values[0] ?? Number.NaN) ? 0 : Number.NaN;
  const average = computeMean(values);
  return computeSum(values.map((value) => (value - average) ** 2)) / (values.length - 1);
};
