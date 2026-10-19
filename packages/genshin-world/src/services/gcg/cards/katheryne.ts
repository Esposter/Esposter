import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { KATHERYNE_ID } from "#src/services/gcg/cards/constants";
import { takeOne } from "@esposter/shared";

// Katheryne: once a round, a switch of character is a fast action instead of a combat action
export const katheryne: GcgCardModule = {
  checkIsSwitchFast: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(KATHERYNE_ID)) return false;
    side.usedCardIds.push(KATHERYNE_ID);
    return true;
  },
};
