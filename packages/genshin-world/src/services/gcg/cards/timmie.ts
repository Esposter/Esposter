import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

const TIMMIE_ID = 322_007;
const PIGEONS_TO_DISCARD = 3;

// Timmie: once per round at the end phase it gains a Pigeon, and at three Pigeons it is discarded, a card is drawn and an
// Omni die is created
export const timmie: GcgCardModule = {
  initialUsages: 1,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(TIMMIE_ID)) return;
    side.usedCardIds.push(TIMMIE_ID);
    zoneCard.counter += 1;
    if (zoneCard.counter < PIGEONS_TO_DISCARD) return;
    zoneCard.usages = 0;
    drawGcgCards(side, 1, duel.rule.handCardLimit);
    createGcgDice(side, GcgDieFace.Omni, 1);
  },
};
