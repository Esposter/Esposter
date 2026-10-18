import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { largeWindSpirit } from "#src/services/gcg/cards/largeWindSpirit";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const LARGE_WIND_SPIRIT_ID = 115_011;
// Forbidden Creation - Isomer 75 / Type II, Sucrose's elemental burst: 1 Anemo DMG, and a Large Wind Spirit is summoned
// (the wiki's Forbidden Creation - Isomer 75 / Type II (Character Card Skill))
const FORBIDDEN_CREATION_DAMAGE = 1;

export const forbiddenCreation: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, LARGE_WIND_SPIRIT_ID, largeWindSpirit);
  },
  getDamage: () => ({ damageType: Element.Anemo, value: FORBIDDEN_CREATION_DAMAGE }),
};
