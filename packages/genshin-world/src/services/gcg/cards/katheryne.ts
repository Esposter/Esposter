import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

const KATHERYNE_ID = 322_002;

// Katheryne: once a round, a switch of character is a fast action instead of a combat action
export const katheryne: GcgCardModule = {
  isSwitchFast: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(KATHERYNE_ID)) return false;
    side.usedCardIds.push(KATHERYNE_ID);
    return true;
  },
};
