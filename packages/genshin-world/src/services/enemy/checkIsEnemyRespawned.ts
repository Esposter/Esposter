import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { EnemyType } from "#src/models/enemy/EnemyType";

import { checkIsBossHeld } from "#src/services/bosses/checkIsBossHeld";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";

// Whether a camp member defeated at a moment is back by another moment, on the respawn time computeEnemyRespawnTime gives.
// A boss with no respawn time is back once a teleport out of its camp's area after its defeat has released it, and is
// Still down until then.
export const checkIsEnemyRespawned = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.Instant,
  now: Temporal.Instant,
  campAreaId: string,
  lastTeleportAts: ReadonlyMap<string, Temporal.Instant>,
  bossBlossom?: TrounceBlossom,
): boolean => {
  const respawnAt = computeEnemyRespawnTime(campEnemyTypes, defeatedAt, bossBlossom);
  if (respawnAt === undefined) return !checkIsBossHeld(campAreaId, defeatedAt, lastTeleportAts);
  return Temporal.Instant.compare(respawnAt, now) <= 0;
};
