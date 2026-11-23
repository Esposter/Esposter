import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { checkIsDevicePlaceable } from "#src/services/gadget/checkIsDevicePlaceable";

// The point the Serenitea Pot stands at in the open world. Used from the gadget slot, the pot is set down at the player's
// Feet, unless the pot already stands and its caps refuse a second, in which case the point it stands at is kept
export const placeHomePot = (
  pot: Pick<GadgetRow, "maxCountByPlayer" | "maxCountInScene">,
  placedPoint: { x: number; z: number } | undefined,
  feet: { x: number; z: number },
): { x: number; z: number } | undefined => {
  const placedCount = placedPoint === undefined ? 0 : 1;
  return checkIsDevicePlaceable(pot, placedCount, placedCount) ? { x: feet.x, z: feet.z } : placedPoint;
};
