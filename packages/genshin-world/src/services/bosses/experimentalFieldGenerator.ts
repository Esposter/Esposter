import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Experimental Field Generator's attacks from its wiki page, in the order the page lists them. The Gravity
// Reduction field is not given a move, as it covers the arena in a gravity field that waits on the scene export.
// Gravity Ripple and the three Enhanced Attacks are used only while that field is active, a phase not yet run. The
// Stygian Onslaught variants are not modelled. Each move's windup and recovery are the common enemies' and are
// PROVISIONAL until measured
export const EXPERIMENTAL_FIELD_GENERATOR_MOVES: BossMove[] = [
  { atkPercent: 50, name: "Laser Sweep", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 60,
    name: "Carpet Bombing",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    name: "Missile Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Gravity Reduction Field is active
  {
    atkPercent: 100,
    element: Element.Geo,
    name: "Gravity Ripple",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Gravity Reduction Field is active
  {
    atkPercent: 80,
    element: Element.Geo,
    name: "Enhanced Attack 2",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Gravity Reduction Field is active
  {
    atkPercent: 80,
    element: Element.Geo,
    name: "Enhanced Attack 3",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Gravity Reduction Field is active
  {
    atkPercent: 100,
    element: Element.Geo,
    name: "Enhanced Attack 4",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The Pneuma-aligned hits that end the Gravity Reduction Field, from the wiki's Gravity Reduction Field entry. Not yet
// Run
export const EXPERIMENTAL_FIELD_GENERATOR_GRAVITY_FIELD_HIT_COUNT = 3;
