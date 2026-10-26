import type { BossMove } from "#src/models/bosses/BossMove";

import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Perpetual Mechanical Array's attacks from its wiki page, in the order the page lists them. Defensive Mode is
// Not an attack: it summons four Ruin Sentinels and paralyses the boss once one is disabled, which is not yet run, and
// So is the gate at 30% health. The wiki's range and priority rules are not yet run either, so the moves go in turn.
// Each move's windup and recovery are the common enemies' until measured
export const PERPETUAL_MECHANICAL_ARRAY_MOVES: BossMove[] = [
  {
    atkPercent: 91.6,
    name: "Rocket Blast",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Orbital Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  { atkPercent: 75, name: "Cube Roll", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 75, name: "Sword Slash", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 58.3,
    name: "Blade Spin",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 33.3,
    name: "Energy Cannon",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
