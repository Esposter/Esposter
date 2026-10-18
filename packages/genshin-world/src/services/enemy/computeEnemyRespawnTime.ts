import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeBossRespawnTime } from "#src/services/bosses/computeBossRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION } from "#src/services/enemy/constants";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";

// When a camp member defeated at a time comes back, by the hardest kind in its camp. A boss is back five seconds after
// Its blossom is claimed, and while it is unclaimed back at the first teleport after its defeat, which the world reports
// As `lastTeleportAt`, and held defeated until then; a camp with an elite comes back whole at the next daily reset on the
// Server's clock; and a common enemy twelve hours on
export const computeEnemyRespawnTime = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.Instant,
  bossBlossom?: TrounceBlossom,
  lastTeleportAt?: Temporal.Instant,
): Temporal.Instant | undefined => {
  if (campEnemyTypes.includes(EnemyType.Boss)) {
    const claimedRespawnTime = computeBossRespawnTime(bossBlossom?.claimedAts ?? []);
    if (claimedRespawnTime) return claimedRespawnTime;
    return lastTeleportAt && Temporal.Instant.compare(lastTeleportAt, defeatedAt) > 0 ? lastTeleportAt : undefined;
  } else if (campEnemyTypes.includes(EnemyType.Elite)) return computeNextDailyReset(defeatedAt);
  else return defeatedAt.add(COMMON_ENEMY_RESPAWN_DURATION);
};
