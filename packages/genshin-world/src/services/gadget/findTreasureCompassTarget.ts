import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { GroundPoint } from "genshin-engine";

import { findNearestPlace } from "#src/services/gadget/findNearestPlace";

// The treasure box a Treasure Compass points to: the nearest unopened chest of the region its city joins, measured from
// The player's position on the ground. None when every chest of that region is opened
export const findTreasureCompassTarget = (
  regionChestPlaces: readonly ChestPlace[],
  openedChestIds: ReadonlySet<string>,
  position: GroundPoint,
): ChestPlace | undefined =>
  findNearestPlace(
    regionChestPlaces.filter(({ id }) => !openedChestIds.has(id)),
    position,
  );
