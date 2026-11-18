import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Hydro Tulpa's attacks from its wiki page, in the order the page lists them, at their base forms. Absorb Half-Tulpa is
// Not an attack, so it is not a move: it sets the enhanced state that the enhanced forms of Spear Toss, Hammer Whirl and
// Sword Combo wait on, a phase not yet run. The Stygian Onslaught variants are not modelled. Each move's windup and recovery
// Are the common enemies' and are PROVISIONAL until measured
export const HYDRO_TULPA_MOVES: BossMove[] = [
  {
    atkPercent: 50,
    element: Element.Hydro,
    name: "Fist Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its enhanced form deals 90% ATK, waiting on the enhanced state
  {
    atkPercent: 60,
    element: Element.Hydro,
    name: "Spear Toss",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its enhanced form deals up to 95% ATK, waiting on the enhanced state
  {
    atkPercent: 65,
    element: Element.Hydro,
    name: "Hammer Whirl",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its enhanced form deals up to 95% ATK, waiting on the enhanced state
  {
    atkPercent: 65,
    element: Element.Hydro,
    name: "Sword Combo",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The smaller lances across the arena, at 20% ATK, are a lesser hit of this attack, so the largest is the 100% ATK lances
  {
    atkPercent: 100,
    element: Element.Hydro,
    name: "Triple Lancestrike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The seconds between the Half-Tulpas that spawn for the Hydro Tulpa to absorb, from its Absorb Half-Tulpa entry. Not yet run
export const HYDRO_TULPA_HALF_TULPA_SPAWN_SECONDS = 12.5;
