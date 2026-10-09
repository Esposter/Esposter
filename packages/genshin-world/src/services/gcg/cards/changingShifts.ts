import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const CHANGING_SHIFTS_ID = 332_002;

// Changing Shifts: the next time its side switches characters, one die of any face less is spent, for one usage
export const changingShifts: GcgCardModule = {
  initialUsages: 1,
  onCostPaid: (_context, subject, zoneCard) => {
    if (checkIsGcgSwitchCost(subject)) zoneCard.usages -= 1;
  },
  play: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(CHANGING_SHIFTS_ID, changingShifts));
  },
  reduceCost: (_context, subject) => (checkIsGcgSwitchCost(subject) ? { count: 1, element: undefined } : undefined),
};
