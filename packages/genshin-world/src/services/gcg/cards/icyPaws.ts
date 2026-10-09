import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { takeOne } from "@esposter/shared";

// Icy Paws, Diona's elemental skill: 2 Cryo DMG, and Cat-Claw Shield grants one Shield point to the active character as it
// Is created, which takes no place on the field (the wiki's Icy Paws (Character Card Skill) and the card's text)
const ICY_PAWS_DAMAGE = 2;
const CAT_CLAW_SHIELD_POINTS = 1;

export const icyPaws: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) user.shield = Math.min(GCG_SHIELD_LIMIT, user.shield + CAT_CLAW_SHIELD_POINTS);
  },
  getDamage: () => ({ damageType: Element.Cryo, value: ICY_PAWS_DAMAGE }),
};
