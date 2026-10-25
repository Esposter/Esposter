export const getGaussianSqrt = (x2: number, a: number, b: number): number =>
  Math.sqrt(a * Math.sqrt(Math.PI / b)) * Math.exp((-Math.PI * Math.PI * x2) / b);
