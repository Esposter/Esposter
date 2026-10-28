import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { addScorpionBlessingStack } from "#src/services/gcg/cards/addScorpionBlessingStack";
import { takeOne } from "@esposter/shared";

const BLAZING_STRIKE_DAMAGE = 3;

// Blazing Strike, Eremite Scorching Loremaster's Elemental Skill: 3 Pyro DMG, then a stack of Scorpion Blessing
export const blazingStrike: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    addScorpionBlessingStack(takeOne(duel.sides, sideIndex));
  },
  getDamage: () => ({ damageType: Element.Pyro, value: BLAZING_STRIKE_DAMAGE }),
};
