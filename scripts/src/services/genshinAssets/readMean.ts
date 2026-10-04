// The mean of a list of numbers, or 0 for none
export const readMean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
