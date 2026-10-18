import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { computeOutlineDistance } from "genshin-engine";

// How many opened chests stand in each catalogue area, by the area's id. A chest counts toward the first area whose outline
// Holds it, as the world reads its area, and a chest no outline holds counts toward none
export const computeOpenedChestCountMap = (
  areas: readonly Pick<CatalogueArea, "id" | "outline">[],
  chestPlaces: readonly ChestPlace[],
  openedChestIds: ReadonlySet<string>,
): ReadonlyMap<string, number> => {
  const countMap = new Map<string, number>();
  for (const { id, position } of chestPlaces) {
    if (!openedChestIds.has(id)) continue;
    const area = areas.find(({ outline }) => computeOutlineDistance(outline, position.x, position.z) === 0);
    if (area) countMap.set(area.id, (countMap.get(area.id) ?? 0) + 1);
  }
  return countMap;
};
