import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

// The Bestest Travel Companion!: two Omni dice are created
export const theBestestTravelCompanion: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    createGcgDice(takeOne(duel.sides, sideIndex), GcgDieFace.Omni, 2);
  },
};
