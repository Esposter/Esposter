export const computeDot = (first: Float64Array, second: Float64Array): number =>
  first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);
