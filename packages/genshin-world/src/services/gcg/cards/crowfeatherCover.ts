import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { checkIsGcgElementalUse } from "#src/services/gcg/effects/checkIsGcgElementalUse";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const CROWFEATHER_COVER_ID = 114_063;
const CROWFEATHER_COVER_DAMAGE_BONUS = 1;

// Crowfeather Cover, a state its character gains: the character deals 1 more Elemental Skill and Elemental Burst DMG, and each
// Such use spends one of its two usages (the wiki's Crowfeather Cover). A normal attack is neither boosted nor spends one
export const crowfeatherCover: GcgCardModule = {
  initialUsages: 2,
  modifyDamageDealt: ({ skill }, damage) =>
    checkIsGcgElementalUse(skill) ? { ...damage, value: damage.value + CROWFEATHER_COVER_DAMAGE_BONUS } : damage,
  onSkillUsed: (_context, skill, zoneCard) => {
    if (checkIsGcgElementalUse(skill)) zoneCard.usages -= 1;
  },
};

// Gives the active character of a side the Crowfeather Cover, as the Tengu Juurai summons do at End Phase
export const applyGcgCrowfeatherCover = (side: GcgSideState): void => {
  placeGcgZoneCard(takeOne(side.characters, side.activeIndex).statuses, CROWFEATHER_COVER_ID, crowfeatherCover);
};
