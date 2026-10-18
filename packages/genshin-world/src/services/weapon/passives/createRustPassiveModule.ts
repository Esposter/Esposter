import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// Rust at its rank: a normal attack its wielder deals is raised by the rank's percentage of DMG, and a charged attack is
// Lowered by the rank's second percentage
export const createRustPassiveModule = (params: number[]): WeaponPassiveModule => {
  const normalAttackBonus = takeOne(params, 0);
  const chargedAttackPenalty = takeOne(params, 1);
  return {
    getStrikeDamageBonus: (strike) => {
      if (strike.attackTag === AttackTag.NormalAttack) return normalAttackBonus;
      if (strike.attackTag === AttackTag.ChargedAttack) return -chargedAttackPenalty;
      return 0;
    },
  };
};
