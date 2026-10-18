import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { shadowswordLoneGale } from "#src/services/gcg/cards/shadowswordLoneGale";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";
import { SHADOWSWORD_LONE_GALE_ID } from "#src/services/gcg/cards/constants";

// Blustering Blade, Maguu Kenki's elemental skill: no damage, and a Shadowsword: Lone Gale is summoned (the wiki's
// Blustering Blade (Character Card Skill))
export const blusteringBlade: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(SHADOWSWORD_LONE_GALE_ID, shadowswordLoneGale),
};
