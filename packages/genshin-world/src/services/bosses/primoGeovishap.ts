import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Primo Geovishap's attacks from its wiki page, in the order the page lists them. Scattered Rocks and Primeval
// Spring deal no damage, so they are not moves: Scattered Rocks only scatters stones, and Primeval Spring replaces
// Primordial Shower at the health share exported below, which is not yet run. The infused element is one of four,
// Set by the encounter, and a move has no field for it, so Elemental-Infused Stones, Elemental Breath and
// Primordial Shower leave element unset. A stone's Pyro lava pool is a lingering DoT with no stated interval, so no
// Hit interval is set for it. PROVISIONAL: the wiki gives no timings, so each move's windup and recovery are the
// Common enemies' until measured
export const PRIMO_GEOVISHAP_MOVES: BossMove[] = [
  {
    atkPercent: 40,
    name: "Elemental-Infused Stones",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 35,
    element: Element.Geo,
    name: "Left Claw",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 40,
    element: Element.Geo,
    name: "Right Claw",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Whirlwind",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 62.5,
    element: Element.Geo,
    name: "Combo Slash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    element: Element.Geo,
    name: "Burrow",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 40,
    name: "Elemental Breath",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Primordial Shower",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its max health at which it stops Primordial Shower for Primeval Spring, whose mechanic is not yet run
export const PRIMO_GEOVISHAP_CRITICAL_HEALTH_PERCENT = 20;
