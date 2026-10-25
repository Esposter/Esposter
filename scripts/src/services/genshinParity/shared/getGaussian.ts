export const getGaussian = (x2: number, a: number, b: number): number =>
  a * Math.sqrt(Math.PI / b) * Math.exp((-Math.PI * Math.PI * x2) / b);
