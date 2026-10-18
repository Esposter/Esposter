import { computeCombinations } from "#src/services/function/computeCombinations";

export const computeCompositions = (total: number, parts: number): null | number => {
  if (!Number.isInteger(total) || !Number.isInteger(parts) || parts < 1 || parts > total) return null;
  return computeCombinations(total - 1, parts - 1);
};
