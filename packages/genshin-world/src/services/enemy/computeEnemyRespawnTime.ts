import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeBossRespawnTime } from "#src/services/bosses/computeBossRespawnTime";
import { COMMON_ENEMY_RESPAWN_DURATION } from "#src/services/enemy/constants";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";

// When a camp member defeated at a time comes back, by the hardest kind in its camp. A boss is back five seconds after its
// Blossom is claimed, and has no time while unclaimed, since `checkIsBossHeld` holds it until a teleport out of its area;
// a camp with an elite comes back whole at the next daily reset on the server's clock; and a common enemy twelve hours on
export const computeEnemyRespawnTime = (
  campEnemyTypes: EnemyType[],
  defeatedAt: Temporal.Instant,
  bossBlossom?: TrounceBlossom,
): Temporal.Instant | undefined => {
  if (campEnemyTypes.includes(EnemyType.Boss)) return computeBossRespawnTime(bossBlossom?.claimedAts ?? []);
  else if (campEnemyTypes.includes(EnemyType.Elite)) return computeNextDailyReset(defeatedAt);
  else return defeatedAt.add(COMMON_ENEMY_RESPAWN_DURATION);
};
