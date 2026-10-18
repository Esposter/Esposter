import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { LEAVE_IT_TO_ME_ID } from "#src/services/gcg/cards/constants";

// Leave It to Me!: the next time its side switches characters, the switch is a fast action, for one usage
export const leaveItToMe: GcgCardModule = {
  initialUsages: 1,
  isSwitchFast: () => true,
  onSwitch: (_context, zoneCard) => {
    zoneCard.usages = 0;
  },
  play: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, LEAVE_IT_TO_ME_ID, leaveItToMe);
  },
};
