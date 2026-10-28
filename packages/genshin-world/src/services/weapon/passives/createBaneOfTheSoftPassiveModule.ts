import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { takeOne } from "@esposter/shared";

// The enemy kinds this passive counts as slimes
const SLIME_ENEMY_KIND_IDS = new Set<number>([EnemyKindId.AnemoSlime]);

// Bane of the Soft at its rank: a strike on a slime is raised by the rank's percentage of DMG
export const createBaneOfTheSoftPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return { getStrikeDamageBonus: (_strike, enemy) => (SLIME_ENEMY_KIND_IDS.has(enemy.enemyKindId) ? damageBonus : 0) };
};
