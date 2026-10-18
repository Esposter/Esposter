import { computeGreatestCommonDivisor } from "#src/services/computeGreatestCommonDivisor";

export const computeLeastCommonMultiple = (left: number, right: number): null | number => {
  if (!Number.isInteger(left) || !Number.isInteger(right)) return null;
  const divisor = computeGreatestCommonDivisor(left, right);
  return divisor === 0 ? 0 : Math.abs((left * right) / divisor);
};
