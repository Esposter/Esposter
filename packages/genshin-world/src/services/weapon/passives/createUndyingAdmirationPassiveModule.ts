import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// Undying Admiration at its rank: an Elemental Skill its wielder deals has its DMG raised by the rank's percentage and its
// CRIT Rate by the rank's second percentage
export const createUndyingAdmirationPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  const criticalRateBonus = takeOne(params, 1);
  return {
    getStrikeCriticalRateBonus: (strike) => (strike.attackTag === AttackTag.ElementalSkill ? criticalRateBonus : 0),
    getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ElementalSkill ? damageBonus : 0),
  };
};
