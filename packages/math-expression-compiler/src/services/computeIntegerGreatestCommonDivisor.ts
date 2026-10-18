import { computeGreatestCommonDivisor } from "#src/services/computeGreatestCommonDivisor";

export const computeIntegerGreatestCommonDivisor = (values: readonly number[]): null | number => {
  if (!values.every((value) => Number.isInteger(value))) return null;
  return values.reduce((total, value) => computeGreatestCommonDivisor(total, value), 0);
};
