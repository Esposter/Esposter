import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const LIBEN_COLLECTION_SIZE = 3;
const LIBEN_DRAW_COUNT = 2;
const LIBEN_OMNI_COUNT = 2;

// Liben, an assist: at the end phase it collects the side's unused Elemental Dice, at most one of each type. When the
// Action Phase begins with three collected, it draws two cards, creates two Omni dice, and is discarded
export const liben: GcgCardModule = {
  initialUsages: 1,
  onActionPhase: ({ duel, sideIndex }, zoneCard) => {
    if ((zoneCard.elements?.length ?? 0) < LIBEN_COLLECTION_SIZE) return;
    const side = takeOne(duel.sides, sideIndex);
    zoneCard.usages = 0;
    drawGcgCards(side, LIBEN_DRAW_COUNT, duel.rule.handCardLimit);
    createGcgDice(side, GcgDieFace.Omni, LIBEN_OMNI_COUNT);
  },
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const collected = zoneCard.elements ?? [];
    side.dice = side.dice.filter((face) => {
      if (face === GcgDieFace.Omni || collected.includes(face)) return true;
      collected.push(face);
      return false;
    });
    zoneCard.elements = collected;
  },
};
