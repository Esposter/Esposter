import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

// Paimon: when the action phase begins, two Omni dice are created, for two usages
export const paimon: GcgCardModule = {
  initialUsages: 2,
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    createGcgDice(takeOne(duel.sides, sideIndex), GcgDieFace.Omni, 2);
    zoneCard.usages -= 1;
  },
};
