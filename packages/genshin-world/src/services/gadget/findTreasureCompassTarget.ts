import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { GroundPoint } from "genshin-engine";

import { computeOutlineDistance } from "genshin-engine";

// The treasure box a Treasure Compass points to: the nearest unopened chest standing inside one of its city's outlines,
// Measured from the player's position on the ground. None when no unopened chest stands in the city
export const findTreasureCompassTarget = (
  chestPlaces: readonly ChestPlace[],
  cityOutlines: readonly (readonly GroundPoint[])[],
  openedChestIds: ReadonlySet<string>,
  position: GroundPoint,
): ChestPlace | undefined => {
  let target: ChestPlace | undefined;
  let targetDistanceSquared = Infinity;
  for (const chestPlace of chestPlaces) {
    const { x, z } = chestPlace.position;
    if (
      openedChestIds.has(chestPlace.id) ||
      !cityOutlines.some((outline) => computeOutlineDistance(outline, x, z) === 0)
    )
      continue;
    const distanceSquared = (x - position.x) ** 2 + (z - position.z) ** 2;
    if (distanceSquared < targetDistanceSquared) {
      target = chestPlace;
      targetDistanceSquared = distanceSquared;
    }
  }
  return target;
};
