// The greatest of many values, reduced rather than spread for the same reason as computeLeast
export const computeGreatest = (values: readonly number[]): number =>
  values.reduce((greatest, value) => Math.max(greatest, value));
