import type { Element } from "#src/models/Element";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GCG_DICE_LIMIT } from "#src/services/gcg/constants";

// Creates dice of one face on a side, up to the most dice it holds: a die past the limit is not made
export const createGcgDice = (side: GcgSideState, face: Element | GcgDieFace, count: number): void => {
  const addedCount = Math.min(count, GCG_DICE_LIMIT - side.dice.length);
  for (let added = 0; added < addedCount; added++) side.dice.push(face);
};
