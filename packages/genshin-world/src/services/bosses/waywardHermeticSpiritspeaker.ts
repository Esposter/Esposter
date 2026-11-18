import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Wayward Hermetic Spiritspeaker's attacks from its wiki page, in the order the page lists them
// The wiki gives no timings, so each move's windup and recovery are the common enemies', PROVISIONAL until measured
export const WAYWARD_HERMETIC_SPIRITSPEAKER_MOVES: BossMove[] = [
  {
    atkPercent: 100,
    element: Element.Cryo,
    name: "Paint Splash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    element: Element.Cryo,
    name: "Double Sweep",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 85,
    element: Element.Cryo,
    name: "Gliding Sweep",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 95,
    element: Element.Cryo,
    name: "Snowball",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Cryo,
    name: "Chilling Blast",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The Radiant Reflections' combo and double sweep are not run yet
  // Their ATK is 12.5% above the boss's, which the percent here does not carry, as the wiki gives it
  // Scanning them to freeze them and strip their shields is not run yet
  {
    atkPercent: 100,
    element: Element.Cryo,
    name: "Radiant Reflections",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The Radiant Reflections the ritual summons, all of which must be destroyed before the boss reappears, is not yet run
export const WAYWARD_HERMETIC_SPIRITSPEAKER_RADIANT_REFLECTION_COUNT = 4;
// The Cryo shield gauge each Radiant Reflection carries, which its destruction breaks, is not yet run
export const WAYWARD_HERMETIC_SPIRITSPEAKER_RADIANT_REFLECTION_SHIELD_GAUGE_UNITS = 8;
