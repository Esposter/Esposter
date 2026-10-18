import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

// One claim takes the level after the last one claimed, and only once the region has reached it, so a level's rewards are
// Paid once and one level at a time. The level taken is returned for its rewards to be paid
export const claimStatueLevel = (
  progress: OfferingProgress<StatueLevel>,
  claimedLevel: number,
): { claimed: StatueLevel | undefined; claimedLevel: number } => {
  const nextLevel = progress.levels.find(({ level }) => level === claimedLevel + 1);
  if (!nextLevel || nextLevel.level > progress.level) return { claimed: undefined, claimedLevel };
  return { claimed: nextLevel, claimedLevel: nextLevel.level };
};
