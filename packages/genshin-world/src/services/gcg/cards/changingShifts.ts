import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { CHANGING_SHIFTS_ID } from "#src/services/gcg/cards/constants";
import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Changing Shifts: the next time its side switches characters, one die of any face less is spent, for one usage
export const changingShifts: GcgCardModule = {
  initialUsages: 1,
  onCostPaid: (_context, subject, zoneCard) => {
    if (checkIsGcgSwitchCost(subject)) zoneCard.usages -= 1;
  },
  play: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, CHANGING_SHIFTS_ID, changingShifts);
  },
  reduceCost: (_context, subject) => (checkIsGcgSwitchCost(subject) ? { count: 1, element: undefined } : undefined),
};
