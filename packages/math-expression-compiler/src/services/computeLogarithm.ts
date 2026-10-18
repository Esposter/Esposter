export const computeLogarithm = (value: number, base: number | undefined): number =>
  base === undefined ? Math.log(value) : Math.log(value) / Math.log(base);
