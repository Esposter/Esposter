import { computeGamma } from "#src/services/function/computeGamma";

export const computeFactorial = (value: number): null | number => {
  if (value < 0) return null;
  return computeGamma(value + 1);
};
