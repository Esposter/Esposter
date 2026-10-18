import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

// The load the placements in one area hold: the first copy of a furnishing takes its load and each further copy its reduced
// Load. A stored placement whose furnishing the table no longer holds counts nothing
export const computeHomeAreaLoad = (
  placements: HomePlacement[],
  itemIdFurnishingMap: Map<number, HomeFurnishing>,
): number => {
  const copyCounts = new Map<number, number>();
  return placements.reduce((total, { furnishingItemId }) => {
    const furnishing = itemIdFurnishingMap.get(furnishingItemId);
    if (furnishing === undefined) return total;
    const copyCount = copyCounts.get(furnishingItemId) ?? 0;
    copyCounts.set(furnishingItemId, copyCount + 1);
    return total + (copyCount === 0 ? furnishing.load : furnishing.discountLoad);
  }, 0);
};
