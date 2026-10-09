import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeSpawnLevel } from "#src/services/adventureRank/computeSpawnLevel";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";

// A camp member as it spawns under a World Level: idle at its spawn, its health and poise full, no element on it and no
// Hit yet, at the level its World Level raises it to
export const createEnemy = (
  { enemyKindId, id, level, patrol, position }: EnemyCampMember,
  campId: string,
  worldLevel = 0,
): Enemy => {
  const spawnLevel = computeSpawnLevel(level, worldLevel);
  const { maxHealth } = computeEnemyStats(getEnemyKind(enemyKindId), spawnLevel);
  const { length } = PoiseTypeSettingsMap[EnemyKindTraitsMap[enemyKindId].poiseType];
  return {
    attackCooldownSeconds: 0,
    campId,
    droppedThresholdCount: 0,
    elementalState: createElementalState(),
    enemyKindId,
    heading: 0,
    health: maxHealth,
    hitSeconds: Infinity,
    home: { ...position },
    id,
    internalCooldownMap: new Map(),
    level: spawnLevel,
    maxHealth,
    patrol,
    patrolIndex: 0,
    poise: length,
    poiseBrokenSeconds: 0,
    position: { ...position },
    state: EnemyState.Idle,
    stateSeconds: 0,
    statuses: [],
  };
};
