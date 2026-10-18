import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { switchGcgSideActive } from "#src/services/gcg/effects/switchGcgSideActive";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

// Hide, Cryo Hilichurl Shooter's passive: after the character uses a skill, the next standing character becomes active
export const hide: GcgSkillModule = {
  afterSkillUsed: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const nextIndex = findGcgAdjacentCharacterIndex(side, side.activeIndex, 1);
    if (nextIndex !== undefined) switchGcgSideActive(side, nextIndex);
  },
};
