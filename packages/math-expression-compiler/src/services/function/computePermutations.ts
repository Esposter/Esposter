export const computePermutations = (available: number, chosen: number): null | number => {
  if (!Number.isInteger(available) || !Number.isInteger(chosen) || chosen < 0 || chosen > available) return null;
  let result = 1;
  for (let factor = available - chosen + 1; factor <= available; factor++) {
    result *= factor;
    if (result > Number.MAX_VALUE) return Number.POSITIVE_INFINITY;
  }
  return result;
};
