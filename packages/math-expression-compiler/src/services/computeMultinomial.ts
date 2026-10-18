import { computeCombinations } from "#src/services/computeCombinations";

export const computeMultinomial = (parts: readonly number[]): null | number => {
  if (!parts.every((part) => Number.isInteger(part) && part > 0)) return null;
  let result = 1;
  let running = 0;
  for (const part of parts) {
    running += part;
    result *= computeCombinations(running, part);
  }
  return result;
};
