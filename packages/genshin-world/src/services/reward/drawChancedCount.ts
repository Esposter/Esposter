// A count of its guaranteed count and one more for each of its trials where `random` falls under its chance: a tree's
// Artifact of one rarity is one trial, and an item with an average draws the units between its least and most as trials
export const drawChancedCount = (
  { chance, guaranteedCount, trials = 1 }: { chance: number; guaranteedCount: number; trials?: number },
  random: () => number,
): number => {
  let count = guaranteedCount;
  for (let trial = 0; trial < trials; trial += 1) if (random() < chance) count += 1;
  return count;
};
