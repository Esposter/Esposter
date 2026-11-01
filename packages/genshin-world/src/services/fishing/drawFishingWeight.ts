import type { FishingWeight } from "#src/models/fishing/FishingWeight";

// The entry a stock draws for a roll in [0, 1), each entry owning the share of the total its weight is. Undefined where
// The stock weighs nothing
export const drawFishingWeight = <T extends FishingWeight>(weights: readonly T[], roll: number): T | undefined => {
  const total = weights.reduce((sum, { weight }) => sum + weight, 0);
  if (total === 0) return undefined;
  const target = roll * total;
  let cumulative = 0;
  return weights.find(({ weight }) => {
    cumulative += weight;
    return target < cumulative;
  });
};
