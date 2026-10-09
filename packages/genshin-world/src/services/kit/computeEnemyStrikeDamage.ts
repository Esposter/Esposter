import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { ENEMY_STRIKE_TALENT_MULTIPLIER } from "#src/services/kit/constants";

// The damage an enemy's strike deals to a combatant: its ATK as physical damage through the combatant's defence and
// Physical resistance
export const computeEnemyStrikeDamage = (enemy: Enemy, combatant: Combatant): number => {
  const { attributeTotalMap, defense } = combatant.attributes;
  const { attack } = computeEnemyStats(getEnemyKind(enemy.enemyKindId), enemy.level);
  return getDamage({
    attackerLevel: enemy.level,
    defense,
    resistance: attributeTotalMap[Attribute.PhysicalResistance],
    stat: attack,
    talentMultiplier: ENEMY_STRIKE_TALENT_MULTIPLIER,
  });
};
