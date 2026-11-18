import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Golden Wolflord's attacks from its wiki page, in the order the page lists them. Corrosion deals no damage, so
// It is not a move. Tornado and Ramming Attack are not used while the shield its Elemental Devourer phase raises
// Stands, and Earthshaking Dive is used only in that phase, which begins at the health share exported below. The
// Rifthound Skulls + Elemental Devourer move starts that phase; its skulls' homing projectiles, the wake-up hit after
// The shield breaks and the stuns after Tornado and Ramming Attack are not run. PROVISIONAL: the wiki gives no timings,
// So each move's windup and recovery are the common enemies' until measured
export const GOLDEN_WOLFLORD_MOVES: BossMove[] = [
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Tornado",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Laser Beam",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Ramming Attack",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 25,
    element: Element.Geo,
    name: "Skull Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Sweep",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Geo,
    name: "Rifthound Skulls + Elemental Devourer",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Geo,
    name: "Earthshaking Dive",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its health at which its Elemental Devourer state begins, with its shield, whose mechanic is not yet run
export const GOLDEN_WOLFLORD_ELEMENTAL_DEVOURER_HEALTH_PERCENT = 70;
// The charged Rifthound Skulls that break its shield, a third of its durability each, whose mechanic is not yet run
export const GOLDEN_WOLFLORD_SHIELD_BREAK_SKULL_COUNT = 3;
