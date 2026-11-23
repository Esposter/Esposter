import type { BossMove } from "#src/models/bosses/BossMove";

import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Aeonblight Drake's attacks from its wiki page, in the order the page lists them. Energy Surge deals Physical DMG
// Or the Element the drake has absorbed, which is not run yet, so it is listed without an element. The 30% ATK hit it
// Deals where it Lands as it turns from Airborne to Grounded is a state change the wiki names no attack for, so it is
// Not a move. Grounded Combo 1 is listed at its own 60% ATK nose hits, and Grounded Combo 2 at the Thruster Smash's
// 75%, the largest hit each makes Of its own. The grounded attacks are used while it is Grounded and the airborne ones
// While it is airborne, states not yet Run. Paralysis deals no share of ATK, so it is left out, and the Stygian
// Onslaught variant's HP thresholds of 75, 50 and 25 Percent are that variant's, not run here. Each move's windup and
// Recovery are the common enemies' and PROVISIONAL until Measured, the wiki giving no timings
export const AEONBLIGHT_DRAKE_MOVES: BossMove[] = [
  {
    atkPercent: 100,
    name: "Energy Surge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  { atkPercent: 75, name: "Tail Sweep", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 75,
    name: "Thruster Smash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    name: "Grounded Combo 1",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    name: "Grounded Combo 2",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    name: "Grounded Charge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    name: "Machine Gun Volley",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    name: "Missile Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    name: "Airborne Charge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
