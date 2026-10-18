import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { guoba } from "#src/services/gcg/cards/guoba";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";
import { GUOBA_ID } from "#src/services/gcg/cards/constants";

// Guoba Attack, Xiangling's elemental skill: no damage, and a Guoba is summoned (the wiki's Guoba Attack (Character Card
// Skill) and the card's text)
export const guobaAttack: GcgSkillModule = { afterDamage: createGcgSummonAfterDamage(GUOBA_ID, guoba) };
