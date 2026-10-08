import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";

// A camp member as it spawns: idle at its spawn, its health and poise full
export const createEnemy = ({ enemyKindId, id, level, patrol, position }: EnemyCampMember, campId: string): Enemy => {
  const { maxHealth } = computeEnemyStats(getEnemyKind(enemyKindId), level);
  const { length } = PoiseTypeSettingsMap[EnemyKindTraitsMap[enemyKindId].poiseType];
  return {
    attackCooldownSeconds: 0,
    campId,
    droppedThresholdCount: 0,
    enemyKindId,
    heading: 0,
    health: maxHealth,
    home: { ...position },
    id,
    level,
    maxHealth,
    patrol,
    patrolIndex: 0,
    poise: length,
    poiseBrokenSeconds: 0,
    position: { ...position },
    state: EnemyState.Idle,
    stateSeconds: 0,
  };
};
