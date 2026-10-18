import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { oz } from "#src/services/gcg/cards/oz";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";
import { OZ_ID } from "#src/services/gcg/cards/constants";

// Nightrider, Fischl's elemental skill: 1 Electro DMG, and Oz is summoned (the wiki's Nightrider (Character Card Skill))
const NIGHTRIDER_DAMAGE = 1;

export const nightrider: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(OZ_ID, oz),
  getDamage: () => ({ damageType: Element.Electro, value: NIGHTRIDER_DAMAGE }),
};
