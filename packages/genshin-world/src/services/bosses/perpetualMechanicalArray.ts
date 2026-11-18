import type { BossMove } from "#src/models/bosses/BossMove";

import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Perpetual Mechanical Array's attacks from its wiki page, in the order the page lists them. Defensive Mode is
// Not an attack: it summons four Ruin Sentinels, and `stepPerpetualMechanicalArrayFight` steps it. The wiki's range and
// Priority rules are not yet run, so the moves go in turn. Each move's windup and recovery are the common enemies' until measured
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

// The share of its max health the boss cannot be damaged past until Defensive Mode has been triggered once, from the wiki
export const PERPETUAL_MECHANICAL_ARRAY_HEALTH_GATE = 0.3;
// The share of its max health at which Defensive Mode triggers, when it has not triggered before its first timed activation
export const PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH = 0.35;
// The seconds into the fight of its first timed Defensive Mode activation, its initial cooldown on the wiki's AI table
export const PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS = 40;
// The seconds Defensive Mode holds with its highlighted sentinel standing before the boss exits it, the exit's cooldown on
// The wiki's AI table (PROVISIONAL: the wiki says only "a long period of time")
export const PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS = 150;
// The seconds the boss is paralysed once its highlighted sentinel is disabled, and the share its base resistances drop by
export const PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS = 20;
export const PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_RESISTANCE_REDUCTION = 0.5;
// The seconds the boss is invulnerable for as its paralysis ends, before it pulls its sentinels back in
export const PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS = 1;
