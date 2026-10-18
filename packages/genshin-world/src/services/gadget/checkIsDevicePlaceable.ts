import type { GadgetRow } from "#src/models/gadget/GadgetRow";

// Whether a device can be placed: the scene holds fewer of it than its scene limit, and the player has placed fewer of it
// Than its player limit
export const checkIsDevicePlaceable = (
  gadget: Pick<GadgetRow, "maxCountByPlayer" | "maxCountInScene">,
  placedInScene: number,
  placedByPlayer: number,
): boolean => placedInScene < gadget.maxCountInScene && placedByPlayer < gadget.maxCountByPlayer;
