import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { rainSword } from "#src/services/gcg/cards/rainSword";
import { createGcgApplicationOnstageAfterDamage } from "#src/services/gcg/effects/createGcgApplicationOnstageAfterDamage";
import { RAIN_SWORD_ID } from "#src/services/gcg/cards/constants";

const FATAL_RAINSCREEN_DAMAGE = 2;

// Fatal Rainscreen, Xingqiu's elemental skill: 2 Hydro DMG, Hydro Application on the active character, and a Rain Sword
// Onstage (the wiki's Fatal Rainscreen (Character Card Skill))
export const fatalRainscreen: GcgSkillModule = {
  afterDamage: createGcgApplicationOnstageAfterDamage(Element.Hydro, RAIN_SWORD_ID, rainSword),
  getDamage: () => ({ damageType: Element.Hydro, value: FATAL_RAINSCREEN_DAMAGE }),
};
