export const computeGreatest = (values: readonly number[]): number =>
  values.reduce((greatest, value) => Math.max(greatest, value));
