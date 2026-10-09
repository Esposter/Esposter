import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { setGcgDiceFaces } from "#src/services/gcg/effects/setGcgDiceFaces";
import { takeOne } from "@esposter/shared";

// Jade Chamber: the first two dice rolled are of the active character's element, and when the action phase begins, with at
// Most three cards in hand, it is discarded for an Omni die
export const jadeChamber: GcgCardModule = {
  initialUsages: 1,
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.hand.length > 3) return;
    zoneCard.usages = 0;
    createGcgDice(side, GcgDieFace.Omni, 1);
  },
  onRollPhase: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    setGcgDiceFaces(side, takeOne(side.characters, side.activeIndex).character.element, 2);
  },
};
