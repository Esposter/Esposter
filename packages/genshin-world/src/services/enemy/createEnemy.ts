import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Except } from "type-fest";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeSpawnLevel } from "#src/services/adventureRank/computeSpawnLevel";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyKindTraits } from "#src/services/enemy/getEnemyKindTraits";
import { PoiseTypeSettingsMap } from "#src/services/enemy/PoiseTypeSettingsMap";

// A member whose kind is a monster id: a camp member's kind, or one a Spiral Abyss chamber fights
type EnemyKindMember = Except<EnemyCampMember, "enemyKindId"> & { enemyKindId: number };

// A camp member as it spawns under a World Level: idle at its spawn, its health and poise full, no element on it and no
// Hit yet, at the level its World Level raises it to
export const createEnemy = (
  { enemyKindMap, enemyLevelCurves }: EnemyTables,
  worldLevelRows: readonly WorldLevelRow[],
  { enemyKindId, id, level, patrol, position }: EnemyKindMember,
  campId: string,
  worldLevel = 0,
): Enemy => {
  const spawnLevel = computeSpawnLevel(worldLevelRows, level, worldLevel);
  const enemyKind = getEnemyKind(enemyKindMap, enemyKindId);
  const { maxHealth } = computeEnemyStats(enemyLevelCurves, enemyKind, spawnLevel);
  const traits = getEnemyKindTraits(enemyKindMap, enemyKindId);
  const { length } = PoiseTypeSettingsMap[traits.poiseType];
  const { shieldHealthFraction } = traits;
  return {
    attackCooldownSeconds: 0,
    campId,
    droppedThresholdCount: 0,
    elementalNodePulsesLeft: 0,
    elementalReactions: [],
    elementalState: createElementalState(),
    enemyFamily: enemyKind.enemyFamily,
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
    moveIndex: 0,
    patrol,
    patrolIndex: 0,
    poise: length,
    poiseBrokenSeconds: 0,
    position: { ...position },
    shield:
      shieldHealthFraction === undefined
        ? undefined
        : { health: maxHealth * shieldHealthFraction, maxHealth: maxHealth * shieldHealthFraction },
    state: EnemyState.Idle,
    stateSeconds: 0,
    statuses: [],
    traits,
  };
};
