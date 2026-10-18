import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";

// Searing Glare, Eremite Scorching Loremaster's Normal Attack: 1 Pyro DMG
export const searingGlare: GcgSkillModule = { getDamage: () => ({ damageType: Element.Pyro, value: 1 }) };
