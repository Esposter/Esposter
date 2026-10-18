import { computeSum } from "#src/services/computeSum";

export const computeNorm = (values: readonly number[]): null | number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return Math.abs(values[0] ?? Number.NaN);
  return Math.sqrt(computeSum(values.map((value) => value * value)));
};
