import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GCG_SUPPORT_LIMIT } from "#src/services/gcg/constants";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

// Kid Kujirai, a support: when the Action Phase begins it creates one Omni die, then, if the opposing Support Zone is not full,
// It moves to that zone. Its text, "Create 1 Omni... transfer this card to your opponent's Support Zone", reads "you" as the side
// Whose zone it sits in, so the die goes to the side it is on when the phase begins, and the move hands that to the other side
export const kidKujirai: GcgCardModule = {
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const opposingSide = takeOne(duel.sides, 1 - sideIndex);
    createGcgDice(side, GcgDieFace.Omni, 1);
    if (opposingSide.supports.length >= GCG_SUPPORT_LIMIT) return;
    side.supports = side.supports.toSpliced(side.supports.indexOf(zoneCard), 1);
    opposingSide.supports.push(zoneCard);
  },
};
