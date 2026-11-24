import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Emperor of Fire and Iron's attacks from its wiki page, in the order the page lists them. Twin Molten Horns is a
// Shield and a phase, and Regeneration deals no damage, so neither is a move. Charging Strike to Searing Coronation are
// Used only while the Molten Horns are intact, a phase not yet run. The Stygian Onslaught variants are not modelled.
// Each move's windup and recovery are the common enemies' and are PROVISIONAL until measured
export const EMPEROR_OF_FIRE_AND_IRON_MOVES: BossMove[] = [
  { atkPercent: 50, name: "Ambush", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 60,
    name: "Left Claw Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    name: "Right Claw Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Molten Horns are intact
  {
    atkPercent: 70,
    name: "Charging Strike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Molten Horns are intact
  {
    atkPercent: 80,
    name: "Leaping Crush",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Molten Horns are intact. The burnt ground it leaves deals 6% ATK as Pyro DMG every 0.5s, a
  // Lingering effect not yet run
  {
    atkPercent: 50,
    element: Element.Pyro,
    name: "Volcanic Eruption",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Molten Horns are intact
  {
    atkPercent: 70,
    element: Element.Pyro,
    name: "Molten Trail",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Molten Horns are intact
  {
    atkPercent: 100,
    element: Element.Pyro,
    name: "Searing Coronation",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The Pyro shield on the Molten Horns, in Gauge Units, whose break ends the horns phase. Not yet run
export const EMPEROR_OF_FIRE_AND_IRON_HORNS_SHIELD_GAUGE_UNITS = 16;
// The seconds after the horns break before the Emperor regrows them, from its Regeneration entry. Not yet run
export const EMPEROR_OF_FIRE_AND_IRON_REGENERATION_SECONDS = 30;
