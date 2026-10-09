import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

const WHEN_THE_CRANE_RETURNED_ID = 332_007;

// When the Crane Returned: the next time its side uses a skill, the next standing character is switched in after it
export const whenTheCraneReturned: GcgCardModule = {
  initialUsages: 1,
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    side.onstages.push(createGcgZoneCard(WHEN_THE_CRANE_RETURNED_ID, whenTheCraneReturned));
  },
  onSkillUsed: ({ duel, sideIndex }, _skill, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const nextIndex = findGcgAdjacentCharacterIndex(side, side.activeIndex, 1);
    if (nextIndex !== undefined) side.activeIndex = nextIndex;
    zoneCard.usages = 0;
  },
};
