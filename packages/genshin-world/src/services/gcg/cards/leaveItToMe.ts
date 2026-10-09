import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const LEAVE_IT_TO_ME_ID = 332_006;

// Leave It to Me!: the next time its side switches characters, the switch is a fast action, for one usage
export const leaveItToMe: GcgCardModule = {
  initialUsages: 1,
  isSwitchFast: () => true,
  onSwitch: (_context, zoneCard) => {
    zoneCard.usages = 0;
  },
  play: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(LEAVE_IT_TO_ME_ID, leaveItToMe));
  },
};
