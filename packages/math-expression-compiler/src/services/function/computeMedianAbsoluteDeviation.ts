import { computeMedian } from "#src/services/function/computeMedian";

export const computeMedianAbsoluteDeviation = (values: readonly number[]): number => {
  const center = computeMedian(values);
  return computeMedian(values.map((value) => Math.abs(value - center)));
};
