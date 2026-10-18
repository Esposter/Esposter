import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { DARKFIRE_FURNACE_ID, darkfireFurnace } from "#src/services/gcg/cards/darkfireFurnace";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const OMINOUS_STAR_DAMAGE = 3;

// Ominous Star, Abyss Lector's elemental burst: 3 Pyro DMG, and Darkfire Furnace is summoned (the wiki's Ominous Star)
export const ominousStar: GcgSkillModule = {
  // The furnace is read when the skill fires, not when this module loads: the furnace imports the damage pipeline, which imports
  // The card maps back to this module, so at load the furnace may still be unfinished
  afterDamage: (context) => createGcgSummonAfterDamage(DARKFIRE_FURNACE_ID, darkfireFurnace)(context),
  getDamage: () => ({ damageType: Element.Pyro, value: OMINOUS_STAR_DAMAGE }),
};
