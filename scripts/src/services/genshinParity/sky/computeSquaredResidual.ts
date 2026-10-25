export const computeSquaredResidual = (ours: readonly number[], reference: readonly number[]): number =>
  ours.reduce((sum, value, index) => sum + (value - (reference[index] ?? 0)) ** 2, 0);
