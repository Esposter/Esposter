export const computeLogarithm = (value: number, base?: number): number =>
  base === undefined ? Math.log(value) : Math.log(value) / Math.log(base);
