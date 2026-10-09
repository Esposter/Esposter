import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Frostgnaw, Kaeya's elemental skill: 3 Cryo DMG (the wiki's Frostgnaw (Character Card Skill))
const FROSTGNAW_DAMAGE = 3;

export const frostgnaw: GcgSkillModule = { getDamage: () => ({ damageType: Element.Cryo, value: FROSTGNAW_DAMAGE }) };
