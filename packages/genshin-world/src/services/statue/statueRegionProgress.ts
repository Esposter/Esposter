import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";

import { countHeldItems } from "#src/services/offering/countHeldItems";

// The Oculus a region's statues take: the one its levels name, the first of any level that takes an item, and zero for a
// Region whose levels name none
export const findStatueItemId = (levels: StatueLevel[]): number => levels.flatMap(({ items }) => items)[0]?.itemId ?? 0;

// A region's saved progress as the rule holds it: the Oculi offered are held against the one Oculus its levels take
export const toStatueRegionProgress = (
  { heldCount, level }: StatueRegionProgressSave,
  levels: StatueLevel[],
): OfferingProgress<StatueLevel> => ({
  heldCounts: heldCount > 0 ? { [String(findStatueItemId(levels))]: heldCount } : {},
  level,
  levels,
});

// A region's progress as the save holds it: the Oculi offered toward its next level, whichever kind they are, the Oculi
// Collected and not yet offered beside them, and the level reached
export const toStatueRegionProgressSave = (
  { heldCounts, level }: OfferingProgress<StatueLevel>,
  collectedCount: number,
): StatueRegionProgressSave => ({ collectedCount, heldCount: countHeldItems(heldCounts), level });
