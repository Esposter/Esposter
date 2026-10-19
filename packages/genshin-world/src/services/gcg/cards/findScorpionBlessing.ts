import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { SCORPION_BLESSING_ID } from "#src/services/gcg/cards/constants";

export const findScorpionBlessing = (side: GcgSideState) =>
  side.onstages.find(({ cardId }) => cardId === SCORPION_BLESSING_ID);
