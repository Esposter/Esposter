import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeSpawnLevel } from "#src/services/adventureRank/computeSpawnLevel";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyKindTraits } from "#src/services/enemy/getEnemyKindTraits";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";

// A camp member as it spawns under a World Level: idle at its spawn, its health and poise full, no element on it and no
// Hit yet, at the level its World Level raises it to
export const createEnemy = (
  { enemyKindMap, enemyLevelCurves }: EnemyTables,
  worldLevelRows: readonly WorldLevelRow[],
  { enemyKindId, id, level, patrol, position }: EnemyCampMember,
  campId: string,
  worldLevel = 0,
): Enemy => {
  const spawnLevel = computeSpawnLevel(worldLevelRows, level, worldLevel);
  const { maxHealth } = computeEnemyStats(enemyLevelCurves, getEnemyKind(enemyKindMap, enemyKindId), spawnLevel);
  const traits = getEnemyKindTraits(enemyKindMap, enemyKindId);
  const { length } = PoiseTypeSettingsMap[traits.poiseType];
  return {
    attackCooldownSeconds: 0,
    campId,
    droppedThresholdCount: 0,
    elementalReactions: [],
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
    moondriftHarmonyHits: [],
    patrol,
    patrolIndex: 0,
    poise: length,
    poiseBrokenSeconds: 0,
    position: { ...position },
    state: EnemyState.Idle,
    stateSeconds: 0,
    statuses: [],
    traits,
  };
};
