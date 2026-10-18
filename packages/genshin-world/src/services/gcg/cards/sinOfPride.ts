import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { CROWFEATHER_COVER_ID } from "#src/services/gcg/cards/crowfeatherCover";
import { checkIsGcgElementalUse } from "#src/services/gcg/effects/checkIsGcgElementalUse";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { takeOne } from "@esposter/shared";

export const SIN_OF_PRIDE_ID = 214_061;
const KUJOU_SARA_ID = 1_406;
const TENGU_STORMCALL_SKILL_ID = 14_062;
const SIN_OF_PRIDE_DAMAGE_BONUS = 1;

// Sin of Pride, Kujou Sara's talent: it is equipped to her while she is active and uses her Tengu Stormcall at once. While she is
// Active with it, her Elemental Skill and Burst deal 1 more DMG when she has Crowfeather Cover, on top of the Cover's own 1 (the
// Wiki's Sin of Pride)
export const sinOfPride: GcgCardModule = {
  ...createGcgTalentCard(KUJOU_SARA_ID, TENGU_STORMCALL_SKILL_ID),
  modifyDamageDealt: ({ duel, sideIndex, skill }, damage) => {
    const side = takeOne(duel.sides, sideIndex);
    const isCoveredByCrowfeather = takeOne(side.characters, side.activeIndex).statuses.some(
      ({ cardId }) => cardId === CROWFEATHER_COVER_ID,
    );
    return checkIsGcgElementalUse(skill) && isCoveredByCrowfeather
      ? { ...damage, value: damage.value + SIN_OF_PRIDE_DAMAGE_BONUS }
      : damage;
  },
};
