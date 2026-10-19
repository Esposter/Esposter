import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { SCORPOCALYPSE_ID } from "#src/services/gcg/cards/constants";

// The Scorpocalypse a side's active character holds, whose counter marks that Burning Assault defeated an opposing character
export const findActiveScorpocalypse = (side: GcgSideState) =>
  side.characters.at(side.activeIndex)?.equipments.find(({ cardId }) => cardId === SCORPOCALYPSE_ID);
