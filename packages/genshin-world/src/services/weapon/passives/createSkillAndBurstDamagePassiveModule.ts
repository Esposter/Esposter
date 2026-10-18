import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// The Stringless at its rank: an Elemental Skill or Elemental Burst its wielder deals is raised by the rank's percentage of DMG
export const createSkillAndBurstDamagePassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (strike) =>
      [AttackTag.ElementalSkill, AttackTag.ElementalBurst].includes(strike.attackTag) ? damageBonus : 0,
  };
};
