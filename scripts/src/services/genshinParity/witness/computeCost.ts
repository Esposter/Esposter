export const computeCost = (residuals: readonly number[]): number =>
  residuals.reduce((sum, value) => sum + value ** 2, 0);
