import { computeCombinations } from "#src/services/computeCombinations";

export const computeCatalan = (index: number): null | number => {
  if (!Number.isInteger(index) || index < 0) return null;
  return Math.round(computeCombinations(2 * index, index) / (index + 1));
};
