import { computeMean } from "#src/services/computeMean";
import { computeSum } from "#src/services/computeSum";

export const computeVariance = (values: readonly number[]): number => {
  if (values.length === 1) return 0;
  const average = computeMean(values);
  return computeSum(values.map((value) => (value - average) ** 2)) / (values.length - 1);
};
