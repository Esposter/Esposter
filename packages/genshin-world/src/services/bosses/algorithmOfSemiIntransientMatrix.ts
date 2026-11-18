import type { BossMove } from "#src/models/bosses/BossMove";

import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Algorithm of Semi-Intransient Matrix of Overseer Network's attacks from its wiki page, in the order the page
// Lists Them, all Physical DMG. Laser Zone is used once, at the fight's start. Repulse, Reshape and Prospect follow its
// Recovery From paralysis, Tracking Laser, Laser Barrage and Missile Blast follow a destroyed part that Electro does
// Not hit in its Recovery state, and Overclocked Attack follows an invisible state held too long, none of which is run
// Yet. Invisible State leaves parts that attack, so it is listed at its largest part hit, 50% ATK, and the parts are
// Summons not run here. Each move's windup and recovery are the common enemies' and PROVISIONAL until measured, the
// Wiki giving no timings
export const ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_MOVES: BossMove[] = [
  { atkPercent: 50, name: "Laser Zone", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 50,
    name: "Invisible State",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  { atkPercent: 40, name: "Repulse", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 70, name: "Reshape", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  { atkPercent: 100, name: "Prospect", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 70,
    name: "Tracking Laser",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    name: "Laser Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Missile Blast",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Overclocked Attack",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The share of the Matrix's max health each part has, at 10% by the wiki, the invisible state's parts not yet run
export const ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_PART_HEALTH_PERCENT = 10;
// The seconds a part is left without damage before it is destroyed on its own, 60 by the wiki, not yet run
export const ALGORITHM_OF_SEMI_INTRANSIENT_MATRIX_PART_DESTRUCTION_SECONDS = 60;
