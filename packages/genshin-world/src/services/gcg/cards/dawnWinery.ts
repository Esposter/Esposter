import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";
import { takeOne } from "@esposter/shared";

const DAWN_WINERY_ID = 321_004;
const DAWN_WINERY_SWITCH_LIMIT = 2;

// Dawn Winery: when its side switches characters, one die of any face less is spent, twice a round
export const dawnWinery: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }, subject) => {
    if (checkIsGcgSwitchCost(subject)) takeOne(duel.sides, sideIndex).usedCardIds.push(DAWN_WINERY_ID);
  },
  reduceCost: ({ duel, sideIndex }, subject) => {
    const usedCount = takeOne(duel.sides, sideIndex).usedCardIds.filter((cardId) => cardId === DAWN_WINERY_ID).length;
    return checkIsGcgSwitchCost(subject) && usedCount < DAWN_WINERY_SWITCH_LIMIT
      ? { count: 1, element: undefined }
      : undefined;
  },
};
