import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { takeOne } from "@esposter/shared";

// Decimate at its rank: a strike on an automaton, a mechanoid Ruin unit, is raised by the rank's percentage of DMG
export const createDecimatePassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return { getStrikeDamageBonus: (_strike, enemy) => (enemy.enemyFamily === EnemyFamily.Automatons ? damageBonus : 0) };
};
