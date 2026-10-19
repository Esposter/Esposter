import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { LARGE_WIND_SPIRIT_ID } from "#src/services/gcg/cards/constants";
import { largeWindSpirit } from "#src/services/gcg/cards/largeWindSpirit";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

// Forbidden Creation - Isomer 75 / Type II, Sucrose's elemental burst: 1 Anemo DMG, and a Large Wind Spirit is summoned
// (the wiki's Forbidden Creation - Isomer 75 / Type II (Character Card Skill))
const FORBIDDEN_CREATION_DAMAGE = 1;

export const forbiddenCreation: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(LARGE_WIND_SPIRIT_ID, largeWindSpirit),
  getDamage: () => ({ damageType: Element.Anemo, value: FORBIDDEN_CREATION_DAMAGE }),
};
