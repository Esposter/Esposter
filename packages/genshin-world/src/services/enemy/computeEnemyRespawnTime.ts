import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeBossRespawnTime } from "#src/services/bosses/computeBossRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION, DAILY_RESET_TIME } from "#src/services/enemy/constants";

// When a camp member defeated at a time comes back, by the hardest kind in its camp. A boss is back five seconds after
// Its blossom is claimed, given as `bossClaimedAt`, and held defeated while unclaimed, so undefined; a camp with an elite
// Comes back whole at the next daily reset; and a common enemy twelve hours on
export const computeEnemyRespawnTime = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.ZonedDateTime,
  bossClaimedAt: Temporal.ZonedDateTime | undefined,
): Temporal.ZonedDateTime | undefined => {
  if (campEnemyTypes.includes(EnemyType.Boss)) return computeBossRespawnTime(bossClaimedAt);
  else if (campEnemyTypes.includes(EnemyType.Elite)) {
    const dailyReset = defeatedAt
      .toPlainDate()
      .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: defeatedAt.timeZoneId });
    return Temporal.ZonedDateTime.compare(dailyReset, defeatedAt) > 0 ? dailyReset : dailyReset.add({ days: 1 });
  } else return defeatedAt.add(COMMON_ENEMY_RESPAWN_DURATION);
};
