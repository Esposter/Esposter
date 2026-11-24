import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Legatus Golem's attacks from its wiki page, in the order the page lists them. Geo Shield is the golem's shield
// And the paralysis its break leaves, not an attack, so it is not a move, and its numbers are constants below. Most
// Attack names are unofficial, as the wiki gives them. The World Quest version of Resonant Detonation is not modelled.
// Each move's windup and recovery are the common enemies' and are PROVISIONAL until measured
export const LEGATUS_GOLEM_MOVES: BossMove[] = [
  // Disabled in the Spiral Abyss, which the move does not yet read
  { atkPercent: 50, name: "Overture", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 80,
    element: Element.Pyro,
    name: "Melee Combo 1",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The cascading explosions after the slashes deal 60% ATK too, so the largest hit is 60
  {
    atkPercent: 60,
    element: Element.Pyro,
    name: "Melee Combo 2",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Pyro,
    name: "Melee Combo 3",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The cascading explosions after the stomp deal 60% ATK, so the largest hit is the stomp's 70%
  {
    atkPercent: 70,
    element: Element.Pyro,
    name: "Melee Combo 4",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 70,
    element: Element.Pyro,
    name: "Drive-By",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Pyro,
    name: "Triple Heatblades",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its resonator is destroyed by LEGATUS_GOLEM_RESONATOR_HIT_COUNT hits, which cut the Geo Shield by 6.4 Gauge Units
  {
    atkPercent: 90,
    element: Element.Pyro,
    name: "Resonant Detonation",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The final large orb is the largest hit, at 80% ATK
  {
    atkPercent: 80,
    element: Element.Pyro,
    name: "Fervorous Tune",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 70,
    element: Element.Pyro,
    name: "Raining Melody",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The three expanding explosions deal 100% ATK each, and the leaping strike that follows deals 200% ATK
  {
    atkPercent: 200,
    element: Element.Pyro,
    name: "Fulgent Fortissimo",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The Geo Shield's durability in Gauge Units, from its entry. Not yet run
export const LEGATUS_GOLEM_GEO_SHIELD_GAUGE_UNITS = 32;
// The share of its original durability a regained Geo Shield is halved down to, from its entry. Not yet run
export const LEGATUS_GOLEM_GEO_SHIELD_MIN_PERCENT = 25;
// The seconds the golem is paralysed after its shield breaks, which the wiki gives as about 12. Not yet run
export const LEGATUS_GOLEM_PARALYSIS_SECONDS = 12;
// The hits that destroy Resonant Detonation's resonator before it explodes, from its entry. Not yet run
export const LEGATUS_GOLEM_RESONATOR_HIT_COUNT = 6;
