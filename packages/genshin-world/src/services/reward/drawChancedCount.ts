// A count of its guaranteed count and one more where `random` falls under its chance, the count a tree's artifact of one
// Rarity is drawn to
export const drawChancedCount = (
  { chance, guaranteedCount }: { chance: number; guaranteedCount: number },
  random: () => number,
): number => guaranteedCount + (random() < chance ? 1 : 0);
