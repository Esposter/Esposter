import type { WeightedValue } from "#src/models/shared/WeightedValue";

import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// One value drawn in proportion to its weight, from a random number in [0, 1) that the caller supplies, so the draw is
// Seeded wherever its caller is
export const drawWeightedValue = <TValue>(
  weightedValues: readonly WeightedValue<TValue>[],
  random: () => number,
): TValue => {
  const totalWeight = weightedValues.reduce((total, { weight }) => total + weight, 0);
  if (totalWeight <= 0)
    throw new InvalidOperationError(Operation.Read, "drawWeightedValue", "no value has a weight to be drawn by");
  let remainingWeight = random() * totalWeight;
  for (const { value, weight } of weightedValues) {
    if (remainingWeight < weight) return value;
    remainingWeight -= weight;
  }
  // A total a rounding step short of its last weight draws the last value
  return takeOne(weightedValues, weightedValues.length - 1).value;
};
