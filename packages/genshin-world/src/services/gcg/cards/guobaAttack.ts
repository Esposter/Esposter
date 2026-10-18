import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { guoba } from "#src/services/gcg/cards/guoba";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const GUOBA_ID = 113_021;

// Guoba Attack, Xiangling's elemental skill: no damage, and a Guoba is summoned (the wiki's Guoba Attack (Character Card
// Skill) and the card's text)
export const guobaAttack: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, GUOBA_ID, guoba);
  },
};
