// The number of ways to choose `chosen` items from `available`. Choosing from the smaller of the chosen and the rest keeps the
// Loop short, and each partial product is a binomial of a smaller count, which only grows, so once one passes the float
// Range the whole count is Infinity, an empty cell, without the loop running on
export const computeCombinations = (available: number, chosen: number): number => {
  const smaller = Math.min(chosen, available - chosen);
  let result = 1;
  for (let step = 1; step <= smaller; step++) {
    result = (result * (available - smaller + step)) / step;
    if (result > Number.MAX_VALUE) return Number.POSITIVE_INFINITY;
  }
  return Math.round(result);
};
