import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { GroundPoint } from "genshin-engine";

// The treasure box a Treasure Compass points to: the nearest unopened chest of the region its city joins, measured from
// The player's position on the ground. None when every chest of that region is opened
export const findTreasureCompassTarget = (
  regionChestPlaces: readonly ChestPlace[],
  openedChestIds: ReadonlySet<string>,
  position: GroundPoint,
): ChestPlace | undefined => {
  let target: ChestPlace | undefined;
  let targetDistanceSquared = Infinity;
  for (const chestPlace of regionChestPlaces) {
    if (openedChestIds.has(chestPlace.id)) continue;
    const { x, z } = chestPlace.position;
    const distanceSquared = (x - position.x) ** 2 + (z - position.z) ** 2;
    if (distanceSquared < targetDistanceSquared) {
      target = chestPlace;
      targetDistanceSquared = distanceSquared;
    }
  }
  return target;
};
