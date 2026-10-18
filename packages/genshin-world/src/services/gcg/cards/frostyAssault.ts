import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { shadowswordGallopingFrost } from "#src/services/gcg/cards/shadowswordGallopingFrost";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";
import { SHADOWSWORD_GALLOPING_FROST_ID } from "#src/services/gcg/cards/constants";

// Frosty Assault, Maguu Kenki's elemental skill: no damage, and a Shadowsword: Galloping Frost is summoned (the wiki's
// Frosty Assault (Character Card Skill))
export const frostyAssault: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(SHADOWSWORD_GALLOPING_FROST_ID, shadowswordGallopingFrost),
};
