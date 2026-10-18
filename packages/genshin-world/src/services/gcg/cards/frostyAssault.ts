import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { shadowswordGallopingFrost } from "#src/services/gcg/cards/shadowswordGallopingFrost";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const SHADOWSWORD_GALLOPING_FROST_ID = 125_012;

// Frosty Assault, Maguu Kenki's elemental skill: no damage, and a Shadowsword: Galloping Frost is summoned (the wiki's
// Frosty Assault (Character Card Skill))
export const frostyAssault: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, SHADOWSWORD_GALLOPING_FROST_ID, shadowswordGallopingFrost);
  },
};
