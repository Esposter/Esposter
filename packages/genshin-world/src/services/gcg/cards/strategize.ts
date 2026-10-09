import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

// Strategize: draw two cards
export const strategize: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    drawGcgCards(takeOne(duel.sides, sideIndex), 2, duel.rule.handCardLimit);
  },
};
