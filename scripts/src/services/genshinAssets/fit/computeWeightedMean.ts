// The mean of values, each counted by its weight: the sum of value times weight over the sum of the weights. Its caller
// holds at least some weight, so the divisor is never zero
export const computeWeightedMean = (entries: readonly { value: number; weight: number }[]): number => {
  const totalWeight = entries.reduce((sum, { weight }) => sum + weight, 0);
  return entries.reduce((sum, { value, weight }) => sum + value * weight, 0) / totalWeight;
};
