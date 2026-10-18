import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { placeGeneralsWarBanner } from "#src/services/gcg/cards/generalsWarBanner";
import { takeOne } from "@esposter/shared";

const INUZAKA_ALL_ROUND_DEFENSE_DAMAGE = 2;

// Inuzaka All-Round Defense, Gorou's Elemental Skill: 2 Geo DMG, then a General's War Banner on her side
export const inuzakaAllRoundDefense: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => placeGeneralsWarBanner(takeOne(duel.sides, sideIndex)),
  getDamage: () => ({ damageType: Element.Geo, value: INUZAKA_ALL_ROUND_DEFENSE_DAMAGE }),
};
