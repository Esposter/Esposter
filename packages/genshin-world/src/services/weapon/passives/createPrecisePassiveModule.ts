import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { takeOne } from "@esposter/shared";

// Precise at its rank: a strike on a weak point is raised by the rank's percentage of DMG
export const createPrecisePassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return { getStrikeDamageBonus: (strike) => (strike.hit.weakPoint ? damageBonus : 0) };
};
