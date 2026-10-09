import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { shadowswordLoneGale } from "#src/services/gcg/cards/shadowswordLoneGale";
import { takeOne } from "@esposter/shared";

const SHADOWSWORD_LONE_GALE_ID = 125_011;

// Blustering Blade, Maguu Kenki's elemental skill: no damage, and a Shadowsword: Lone Gale is summoned (the wiki's
// Blustering Blade (Character Card Skill))
export const blusteringBlade: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).summons.push(createGcgZoneCard(SHADOWSWORD_LONE_GALE_ID, shadowswordLoneGale));
  },
};
