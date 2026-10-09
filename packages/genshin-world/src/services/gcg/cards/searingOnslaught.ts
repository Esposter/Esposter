import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { takeOne } from "@esposter/shared";

const SEARING_ONSLAUGHT_ID = 13_012;
const THIRD_USE = 2;
// Searing Onslaught, Diluc's elemental skill: 3 Pyro DMG, and +2 on the third use each round (the wiki's Searing Onslaught)
const SEARING_ONSLAUGHT_DAMAGE = 3;
const SEARING_ONSLAUGHT_THIRD_USE_BONUS = 2;

export const searingOnslaught: GcgSkillModule = {
  getDamage: ({ duel, sideIndex }) => {
    const usesBefore = takeOne(duel.sides, sideIndex).usedSkillIds.filter(
      (skillId) => skillId === SEARING_ONSLAUGHT_ID,
    ).length;
    const bonus = usesBefore === THIRD_USE ? SEARING_ONSLAUGHT_THIRD_USE_BONUS : 0;
    return { damageType: Element.Pyro, value: SEARING_ONSLAUGHT_DAMAGE + bonus };
  },
};
