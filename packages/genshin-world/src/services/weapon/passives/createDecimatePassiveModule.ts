import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { takeOne } from "@esposter/shared";

// Decimate at its rank: a strike on an automaton, a mechanoid Ruin unit, is raised by the rank's percentage of DMG
export const createDecimatePassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return { getStrikeDamageBonus: (_strike, enemy) => (enemy.enemyFamily === EnemyFamily.Automatons ? damageBonus : 0) };
};
