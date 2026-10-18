import type { OfferingLevel, OfferingLevelItem } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

// Sets the count held of an item, an item held none of being left out of the counts
const setHeldCount = (
  heldCounts: Readonly<Record<string, number>>,
  itemId: number,
  count: number,
): Record<string, number> => {
  const nextHeldCounts: Record<string, number> = { ...heldCounts, [itemId]: count };
  if (count <= 0) delete nextHeldCounts[itemId];
  return nextHeldCounts;
};

// Whether the counts hold every item a level takes, each in the count it takes
const holdsLevelItems = (heldCounts: Readonly<Record<string, number>>, items: OfferingLevelItem[]): boolean =>
  items.every(({ itemCount, itemId }) => (heldCounts[itemId] ?? 0) >= itemCount);

// Offers items to an offering: each item offered joins the count held of it, and each next level whose every item the
// Counts now hold is reached in turn, taking each of its items off. The levels reached are returned in order so the caller
// Pays each one. Past the last level the items are held with no level to reach. A level naming no item is reached at once,
// So offering none starts an offering at its first level
export const offerItems = <TLevel extends OfferingLevel>(
  progress: OfferingProgress<TLevel>,
  offeredItems: OfferingLevelItem[],
): { gainedLevels: TLevel[]; progress: OfferingProgress<TLevel> } => {
  const findNextLevel = (level: number): TLevel | undefined =>
    progress.levels.find((offeringLevel) => offeringLevel.level === level + 1);
  let heldCounts: Readonly<Record<string, number>> = offeredItems.reduce(
    (counts, { itemCount, itemId }) => setHeldCount(counts, itemId, (counts[itemId] ?? 0) + itemCount),
    progress.heldCounts,
  );
  let level = progress.level;
  const gainedLevels: TLevel[] = [];
  let nextLevel = findNextLevel(level);
  while (nextLevel && holdsLevelItems(heldCounts, nextLevel.items)) {
    for (const { itemCount, itemId } of nextLevel.items)
      heldCounts = setHeldCount(heldCounts, itemId, (heldCounts[itemId] ?? 0) - itemCount);
    level = nextLevel.level;
    gainedLevels.push(nextLevel);
    nextLevel = findNextLevel(level);
  }
  return { gainedLevels, progress: { ...progress, heldCounts, level } };
};
