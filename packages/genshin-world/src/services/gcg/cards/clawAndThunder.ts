import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Claw and Thunder, Razor's elemental skill: 3 Electro DMG (the wiki's Claw and Thunder (Character Card Skill))
const CLAW_AND_THUNDER_DAMAGE = 3;

export const clawAndThunder: GcgSkillModule = {
  getDamage: () => ({ damageType: Element.Electro, value: CLAW_AND_THUNDER_DAMAGE }),
};
