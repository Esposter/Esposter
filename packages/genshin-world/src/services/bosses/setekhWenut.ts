import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Setekh Wenut's attacks from its wiki page, in the order the page lists them. Transition to Phase 2 and Dig deal
// No Share of ATK, so they are left out. Sweep and Spit are used in Phase 1 only, which the Spiral Abyss skips, the
// Phase 2 Attacks in Phase 2 and again in Phase 3, and Floating State in Phase 3, the phases not yet run. Each move's
// Windup and Recovery are the common enemies' and PROVISIONAL until measured, the wiki giving no timings
export const SETEKH_WENUT_MOVES: BossMove[] = [
  { atkPercent: 100, name: "Sweep", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Spit",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  { atkPercent: 100, name: "Thrust", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Stream of Gales",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Anemo,
    name: "Stormbreath",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Anemo,
    name: "Pressurized Beam",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Anemo,
    name: "Floating State",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The share of its health at which the Setekh Wenut enters Phase 2, 97.5% by the wiki, not yet run
export const SETEKH_WENUT_PHASE_2_HEALTH_PERCENT = 97.5;
// The seconds into the fight at which it enters Phase 2 whatever its health, 20 by the wiki, not yet run
export const SETEKH_WENUT_PHASE_2_SECONDS = 20;
// The share of its health at which it enters Phase 3, at 50% by the wiki, its phase mechanics not yet run
export const SETEKH_WENUT_PHASE_3_HEALTH_PERCENT = 50;
// The seconds into Phase 2 at which it enters Phase 3 whatever its health, 60 by the wiki, not yet run
export const SETEKH_WENUT_PHASE_3_SECONDS = 60;
// The Windbite Bullets destroyed in succession that paralyse it, two by the wiki, not yet run
export const SETEKH_WENUT_PARALYSIS_BULLET_COUNT = 2;
// The seconds it stays paralysed for, about 10 by the wiki, not yet run
export const SETEKH_WENUT_PARALYSIS_SECONDS = 10;
