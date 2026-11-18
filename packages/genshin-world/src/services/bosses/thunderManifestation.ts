import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Thunder Manifestation's attacks from its wiki page, in the order the page lists them: the five it uses while it
// Is not enraged, then the seven it uses once it is. Blink deals no damage, so it is not a move. Enraged is
// Reached when its Fury bar fills at the health share exported below, or when a Close-Range Detection or Shockwave hit
// Locks it onto a player. The enraged moves are gated by that state, which is not yet run. Homing Thunder Cage is a
// Lingering DoT with no stated interval, so no hit interval is set for it. PROVISIONAL: the wiki gives no timings, so
// Each move's windup and recovery are the common enemies' until measured
export const THUNDER_MANIFESTATION_MOVES: BossMove[] = [
  {
    atkPercent: 16.6,
    element: Element.Electro,
    name: "Lightning Probes",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 83.3,
    element: Element.Electro,
    name: "Close-Range Detection",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 43.3,
    element: Element.Electro,
    name: "Random Strikes",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 27.7,
    element: Element.Electro,
    name: "Slicing Storm",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 27.7,
    element: Element.Electro,
    name: "Shockwave",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 27.7,
    element: Element.Electro,
    name: "Slicing Storm",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 55.5,
    element: Element.Electro,
    name: "Thunderous Wingslash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Electro,
    name: "Strifeful Lightning",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 28.8,
    element: Element.Electro,
    name: "Sundering Plumes",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 83.3,
    element: Element.Electro,
    name: "Dive Bomb",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 43.3,
    element: Element.Electro,
    name: "Torrential Descent",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 27.7,
    element: Element.Electro,
    name: "Homing Thunder Cage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its health at which its Fury bar fills and it enrages, per its Strategy, whose mechanic is not yet run
export const THUNDER_MANIFESTATION_FURY_HEALTH_PERCENT = 75;
// The share of its health at which its Shockwave turns full-arena, per its entry, whose mechanic is not yet run
export const THUNDER_MANIFESTATION_FULL_ARENA_SHOCKWAVE_HEALTH_PERCENT = 74;
// The hits it sustains before it releases its Shockwave, whose mechanic is not yet run
export const THUNDER_MANIFESTATION_SHOCKWAVE_HIT_COUNT = 10;
