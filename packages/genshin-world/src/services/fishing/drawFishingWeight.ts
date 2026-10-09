import type { FishingWeight } from "#src/models/fishing/FishingWeight";

// The fish a stock draws for a roll in [0, 1), each fish owning the share of the total its weight is. Undefined where the
// Stock weighs nothing
export const drawFishingWeight = (weights: readonly FishingWeight[], roll: number): number | undefined => {
  const total = weights.reduce((sum, { weight }) => sum + weight, 0);
  if (total === 0) return undefined;
  const target = roll * total;
  let cumulative = 0;
  return weights.find(({ weight }) => {
    cumulative += weight;
    return target < cumulative;
  })?.fishId;
};
