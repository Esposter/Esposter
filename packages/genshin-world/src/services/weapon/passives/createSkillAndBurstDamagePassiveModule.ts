import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// The Stringless at its rank: an Elemental Skill or Elemental Burst its wielder deals is raised by the rank's percentage of DMG
export const createSkillAndBurstDamagePassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (strike) =>
      strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0,
  };
};
