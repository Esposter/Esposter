import type { BossMove } from "#src/models/bosses/BossMove";

import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Anemo Hypostasis's moves from its wiki page. The wiki gives no timings, so each move's windup and recovery are the
// Common enemies' until measured, the provisional timings the change names
export const ANEMO_HYPOSTASIS_MOVES: BossMove[] = [
  { atkPercent: 100, name: "Crystalfly", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 150, name: "Vacuum", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 100, name: "Clap", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 100, name: "Meteors", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 75, name: "Missiles", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 75, name: "Tornadoes", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 100,
    name: "Vacuum Burst",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its health at which the Anemo Hypostasis turns to Second Wind, at about 5% by the wiki. Second Wind
// Revives it once, and it dies for good when its health reaches zero again
export const ANEMO_HYPOSTASIS_SECOND_WIND_HEALTH_PERCENT = 5;
