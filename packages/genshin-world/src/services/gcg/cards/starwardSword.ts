import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Starward Sword, Keqing's elemental burst: 4 Electro DMG, and 3 Piercing DMG to each opposing character on standby
// (the wiki's Starward Sword (Character Card Skill))
const STARWARD_SWORD_DAMAGE = 4;
const STARWARD_SWORD_STANDBY_PIERCING = 3;

export const starwardSword: GcgSkillModule = {
  getDamage: () => ({ damageType: Element.Electro, value: STARWARD_SWORD_DAMAGE }),
  getStandbyPiercing: () => STARWARD_SWORD_STANDBY_PIERCING,
};
