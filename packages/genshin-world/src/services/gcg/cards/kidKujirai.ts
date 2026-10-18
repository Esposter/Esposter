import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GCG_SUPPORT_LIMIT } from "#src/services/gcg/constants";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

export const KID_KUJIRAI_ID = 322_014;

// Kid Kujirai, a companion support: when the Action Phase begins it creates one Omni die, then, if the opposing Support Zone
// Is not full, it moves to that zone
export const kidKujirai: GcgCardModule = {
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const opposingSide = takeOne(duel.sides, 1 - sideIndex);
    createGcgDice(side, GcgDieFace.Omni, 1);
    if (opposingSide.supports.length >= GCG_SUPPORT_LIMIT) return;
    side.supports.splice(side.supports.indexOf(zoneCard), 1);
    opposingSide.supports.push(zoneCard);
  },
};
