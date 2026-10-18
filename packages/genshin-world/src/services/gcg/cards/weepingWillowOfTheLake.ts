import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { takeOne } from "@esposter/shared";

export const WEEPING_WILLOW_OF_THE_LAKE_ID = 321_016;
const WEEPING_WILLOW_OF_THE_LAKE_USAGES = 2;
const WEEPING_WILLOW_OF_THE_LAKE_HAND_LIMIT = 2;
const WEEPING_WILLOW_OF_THE_LAKE_DRAW = 2;

// Weeping Willow of the Lake, a Support: at each End Phase, while its side's hand holds no more than 2 cards, 2 are drawn, and
// That draw spends one of its 2 usages
export const weepingWillowOfTheLake: GcgCardModule = {
  initialUsages: WEEPING_WILLOW_OF_THE_LAKE_USAGES,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.hand.length <= WEEPING_WILLOW_OF_THE_LAKE_HAND_LIMIT) {
      drawGcgCards(side, WEEPING_WILLOW_OF_THE_LAKE_DRAW, duel.rule.handCardLimit);
      zoneCard.usages -= 1;
    }
    return undefined;
  },
};
