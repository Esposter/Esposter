import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { RAINBOW_BLADEWORK_ID } from "#src/services/gcg/cards/constants";
import { rainbowBladework } from "#src/services/gcg/cards/rainbowBladework";
import { createGcgApplicationOnstageAfterDamage } from "#src/services/gcg/effects/createGcgApplicationOnstageAfterDamage";

const RAINCUTTER_DAMAGE = 2;

// Raincutter, Xingqiu's elemental burst: 2 Hydro DMG, Hydro Application on the active character, and a Rainbow Bladework
// Onstage (the wiki's Raincutter (Character Card Skill))
export const raincutter: GcgSkillModule = {
  afterDamage: createGcgApplicationOnstageAfterDamage(Element.Hydro, RAINBOW_BLADEWORK_ID, rainbowBladework),
  getDamage: () => ({ damageType: Element.Hydro, value: RAINCUTTER_DAMAGE }),
};
