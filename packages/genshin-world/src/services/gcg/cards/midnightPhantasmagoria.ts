import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Midnight Phantasmagoria, Fischl's elemental burst: 4 Electro DMG, and 2 Piercing DMG to each opposing character on standby
// (the wiki's Midnight Phantasmagoria (Character Card Skill))
const MIDNIGHT_PHANTASMAGORIA_DAMAGE = 4;
const MIDNIGHT_PHANTASMAGORIA_PIERCING_DAMAGE = 2;

export const midnightPhantasmagoria: GcgSkillModule = {
  getDamage: () => ({ damageType: Element.Electro, value: MIDNIGHT_PHANTASMAGORIA_DAMAGE }),
  getStandbyPiercing: () => MIDNIGHT_PHANTASMAGORIA_PIERCING_DAMAGE,
};
