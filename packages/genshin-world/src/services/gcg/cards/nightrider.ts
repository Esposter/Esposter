import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { oz } from "#src/services/gcg/cards/oz";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const OZ_ID = 114_011;
// Nightrider, Fischl's elemental skill: 1 Electro DMG, and Oz is summoned (the wiki's Nightrider (Character Card Skill))
const NIGHTRIDER_DAMAGE = 1;

export const nightrider: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).summons.push(createGcgZoneCard(OZ_ID, oz));
  },
  getDamage: () => ({ damageType: Element.Electro, value: NIGHTRIDER_DAMAGE }),
};
