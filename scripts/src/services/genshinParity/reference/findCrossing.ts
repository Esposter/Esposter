// The place along the profile where it first reaches the level, between the two samples that straddle it
export const findCrossing = (levels: readonly number[], level: number): number | undefined => {
  const index = levels.findIndex((value) => value >= level);
  if (index === -1) return undefined;
  if (index === 0) return 0;
  const before = levels[index - 1] ?? 0;
  const after = levels[index] ?? 0;
  return index - 1 + (level - before) / (after - before);
};
