export const average = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
