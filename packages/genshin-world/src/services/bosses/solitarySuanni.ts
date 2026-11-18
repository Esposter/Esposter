import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Solitary Suanni's attacks from its wiki page, in the order the page lists them. Lunge deals no damage, so it is
// Not a move. Spirittide Deluge and Spiritwind Storm are used at once on falling below the health shares exported
// Below, and the paralysis that freezing it during a charge brings is not run. Circling Winds, Crashing Waves takes
// Hydro, its wave being the largest hit. PROVISIONAL: the wiki gives no timings, so each move's windup and recovery
// Are the common enemies' until measured
export const SOLITARY_SUANNI_MOVES: BossMove[] = [
  {
    atkPercent: 100,
    element: Element.Hydro,
    name: "Circling Winds, Crashing Waves",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Hydro,
    name: "Slicing Waves",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Hydro,
    name: "Splash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    element: Element.Anemo,
    name: "Golden Scalesurge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Stomp",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 200,
    element: Element.Hydro,
    name: "Spirittide Deluge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 200,
    element: Element.Anemo,
    name: "Spiritwind Storm",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its health below which it uses Spirittide Deluge at once, whose mechanic is not yet run
export const SOLITARY_SUANNI_SPIRITTIDE_DELUGE_HEALTH_PERCENT = 70;
// The share of its health below which it uses Spiritwind Storm at once, whose mechanic is not yet run
export const SOLITARY_SUANNI_SPIRITWIND_STORM_HEALTH_PERCENT = 40;
// The Spiritwind Pearls orbiting it in Spiritwind Storm, destroyed all to paralyse it; its mechanic is not yet run
export const SOLITARY_SUANNI_SPIRITWIND_PEARL_COUNT = 3;
