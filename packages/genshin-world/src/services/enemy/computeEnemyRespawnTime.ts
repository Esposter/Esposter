import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeBossRespawnTime } from "#src/services/bosses/computeBossRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION, DAILY_RESET_TIME } from "#src/services/enemy/constants";

// When a camp member defeated at a time comes back, by the hardest kind in its camp. A boss is back five seconds after
// Its blossom is claimed, and while it is unclaimed back at the first teleport after its defeat, which the world reports
// As `lastTeleportAt`, and held defeated until then; a camp with an elite comes back whole at the next daily reset; and a
// Common enemy twelve hours on
export const computeEnemyRespawnTime = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.ZonedDateTime,
  bossBlossom?: TrounceBlossom,
  lastTeleportAt?: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime | undefined => {
  if (campEnemyTypes.includes(EnemyType.Boss)) {
    const claimedRespawnTime = computeBossRespawnTime(bossBlossom?.claimedAt);
    if (claimedRespawnTime) return claimedRespawnTime;
    return lastTeleportAt && Temporal.ZonedDateTime.compare(lastTeleportAt, defeatedAt) > 0
      ? lastTeleportAt
      : undefined;
  } else if (campEnemyTypes.includes(EnemyType.Elite)) {
    const dailyReset = defeatedAt
      .toPlainDate()
      .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: defeatedAt.timeZoneId });
    return Temporal.ZonedDateTime.compare(dailyReset, defeatedAt) > 0 ? dailyReset : dailyReset.add({ days: 1 });
  } else return defeatedAt.add(COMMON_ENEMY_RESPAWN_DURATION);
};
