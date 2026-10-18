import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// Sharp at its rank: a normal attack its wielder deals is raised by the rank's percentage of DMG
export const createSharpPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return { getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.NormalAttack ? damageBonus : 0) };
};
