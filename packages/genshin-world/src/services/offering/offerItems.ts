import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

// Offers items to an offering: the count offered joins the held count, and each next level whose items the count now
// Holds is reached in turn, taking those items off it. The levels reached are returned in order so the caller pays each
// One. Past the last level the items are held with no level to reach. Level 1 takes no items, so offering none starts it
export const offerItems = <TLevel extends OfferingLevel>(
  progress: OfferingProgress<TLevel>,
  offeredCount: number,
): { gainedLevels: TLevel[]; progress: OfferingProgress<TLevel> } => {
  const findNextLevel = (level: number): TLevel | undefined =>
    progress.levels.find((offeringLevel) => offeringLevel.level === level + 1);
  let heldCount = progress.heldCount + offeredCount;
  let level = progress.level;
  const gainedLevels: TLevel[] = [];
  let nextLevel = findNextLevel(level);
  while (nextLevel && heldCount >= nextLevel.itemCount) {
    heldCount -= nextLevel.itemCount;
    level = nextLevel.level;
    gainedLevels.push(nextLevel);
    nextLevel = findNextLevel(level);
  }
  return { gainedLevels, progress: { ...progress, heldCount, level } };
};
