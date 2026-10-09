import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { theWolfWithin } from "#src/services/gcg/cards/theWolfWithin";
import { takeOne } from "@esposter/shared";

const THE_WOLF_WITHIN_ID = 114_021;
// Lightning Fang, Razor's burst: 3 Electro DMG, and the active character gains The Wolf Within once the damage is dealt
// (the wiki's Lightning Fang (Character Card Skill))
const LIGHTNING_FANG_DAMAGE = 3;

export const lightningFang: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    takeOne(side.characters, side.activeIndex).statuses.push(createGcgZoneCard(THE_WOLF_WITHIN_ID, theWolfWithin));
  },
  getDamage: () => ({ damageType: Element.Electro, value: LIGHTNING_FANG_DAMAGE }),
};
