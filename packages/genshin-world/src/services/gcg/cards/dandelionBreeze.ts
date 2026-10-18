import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { dandelionField } from "#src/services/gcg/cards/dandelionField";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const DANDELION_FIELD_ID = 115_021;
// Dandelion Breeze, Jean's elemental burst: every character of the side heals for 2 HP, and a Dandelion Field is summoned (the
// Wiki's Dandelion Breeze (Character Card Skill) and the card's text)
const DANDELION_BREEZE_HEAL = 2;

export const dandelionBreeze: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    for (const character of side.characters) healGcgCharacter(character, DANDELION_BREEZE_HEAL);
    placeGcgZoneCard(side.summons, DANDELION_FIELD_ID, dandelionField);
  },
};
