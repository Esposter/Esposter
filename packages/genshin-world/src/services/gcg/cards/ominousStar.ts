import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { DARKFIRE_FURNACE_ID } from "#src/services/gcg/cards/constants";
import { darkfireFurnace } from "#src/services/gcg/cards/darkfireFurnace";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const OMINOUS_STAR_DAMAGE = 3;

// Ominous Star, Abyss Lector's elemental burst: 3 Pyro DMG, and Darkfire Furnace is summoned (the wiki's Ominous Star)
export const ominousStar: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(DARKFIRE_FURNACE_ID, darkfireFurnace),
  getDamage: () => ({ damageType: Element.Pyro, value: OMINOUS_STAR_DAMAGE }),
};
