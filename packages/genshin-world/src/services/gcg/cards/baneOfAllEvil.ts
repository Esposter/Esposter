import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { YAKSHAS_MASK_ID, yakshasMask } from "#src/services/gcg/cards/yakshasMask";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const BANE_OF_ALL_EVIL_DAMAGE = 4;

// Bane of All Evil, Xiao's burst: 4 Anemo DMG, and Xiao gains Yaksha's Mask once the damage is dealt (the wiki's Bane of All
// Evil (Character Card Skill))
export const baneOfAllEvil: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(takeOne(side.characters, side.activeIndex).statuses, YAKSHAS_MASK_ID, yakshasMask);
  },
  getDamage: () => ({ damageType: Element.Anemo, value: BANE_OF_ALL_EVIL_DAMAGE }),
};
