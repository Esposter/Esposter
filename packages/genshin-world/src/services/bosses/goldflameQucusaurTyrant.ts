import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Goldflame Qucusaur Tyrant's attacks from its wiki page, in the order the page lists them
// The wiki gives no timings, so each move's windup and recovery are the common enemies', PROVISIONAL until measured
// Golden Flame Transformation enters the Golden Flame form, a phase, whose feather barrages and dive are not run yet
export const GOLDFLAME_QUCUSAUR_TYRANT_MOVES: BossMove[] = [
  {
    atkPercent: 55,
    element: Element.Pyro,
    name: "Shockwave",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 40,
    element: Element.Pyro,
    name: "Wing Swipe",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    element: Element.Pyro,
    name: "Charge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 55,
    element: Element.Pyro,
    name: "Sweep and Charge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The listed hit is the dive over a Flamewind Feather still intact, the largest of the form's attacks
  // The dive over a feather already destroyed, which deals less, is not run yet
  {
    atkPercent: 100,
    element: Element.Pyro,
    name: "Golden Flame Transformation",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The seconds the Golden Flame form lasts before it expires, a time limit whose mechanic is not yet run
export const GOLDFLAME_QUCUSAUR_TYRANT_GOLDEN_FLAME_SECONDS = 45;
// The Pyro shield gauge the Golden Flame form gains, whose destruction exits the form early, is not yet run
export const GOLDFLAME_QUCUSAUR_TYRANT_GOLDEN_FLAME_SHIELD_GAUGE_UNITS = 24;
