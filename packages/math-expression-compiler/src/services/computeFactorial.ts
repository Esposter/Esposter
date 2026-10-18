import { computeGamma } from "#src/services/computeGamma";

export const computeFactorial = (value: number): null | number => {
  if (value < 0) return null;
  return computeGamma(value + 1);
};
