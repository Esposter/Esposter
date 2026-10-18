import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { EnemyType } from "#src/models/enemy/EnemyType";

import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";

// Whether a camp member defeated at a moment is back by another moment, on the respawn time computeEnemyRespawnTime gives.
// A member with no respawn time yet is still down: a boss waiting on its blossom's claim or on the next teleport.
export const checkIsEnemyRespawned = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.Instant,
  now: Temporal.Instant,
  bossBlossom?: TrounceBlossom,
  lastTeleportAt?: Temporal.Instant,
): boolean => {
  const respawnAt = computeEnemyRespawnTime(campEnemyTypes, defeatedAt, bossBlossom, lastTeleportAt);
  return respawnAt !== undefined && Temporal.Instant.compare(respawnAt, now) <= 0;
};
