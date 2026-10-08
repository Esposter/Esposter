import { EnemyType } from "#src/models/enemy/EnemyType";
import { COMMON_ENEMY_RESPAWN_DURATION, DAILY_RESET_TIME } from "#src/services/enemy/constants";

// When a camp member defeated at a time comes back, by the hardest kind in its camp. A boss is back once its reward is
// Claimed, which the world takes as at once, so it is there on its region's next load; a camp with an elite comes
// Back whole at the next daily reset; and a common enemy twelve hours on
export const computeEnemyRespawnTime = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime => {
  if (campEnemyTypes.includes(EnemyType.Boss)) return defeatedAt;
  else if (campEnemyTypes.includes(EnemyType.Elite)) {
    const dailyReset = defeatedAt
      .toPlainDate()
      .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: defeatedAt.timeZoneId });
    return Temporal.ZonedDateTime.compare(dailyReset, defeatedAt) > 0 ? dailyReset : dailyReset.add({ days: 1 });
  } else return defeatedAt.add(COMMON_ENEMY_RESPAWN_DURATION);
};
