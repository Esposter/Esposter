import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

// Liyue Harbor Wharf: at the end phase two cards are drawn, for two usages
export const liyueHarborWharf: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    drawGcgCards(takeOne(duel.sides, sideIndex), 2, duel.rule.handCardLimit);
    zoneCard.usages -= 1;
  },
};
