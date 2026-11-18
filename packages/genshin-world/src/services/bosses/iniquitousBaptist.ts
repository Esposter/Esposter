import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Iniquitous Baptist's attacks from its wiki page, in the order the page lists them. Teleport deals no share of
// ATK, so It is left out. Elemental Rings is used in the overworld only and its nodes each deal their own element, and
// Phase Cycle's Orbs match the current and next shields, so neither is listed with one element. Each Phase block is
// Used while its shield Is active, after Phase Cycle begins with the first Elemental Rings, none of which is run yet.
// The stamina, energy, cooldown And HP drains these attacks carry are statuses a move does not hold, and the Stygian
// Onslaught variant's ward figures are Its own, not run here. Each move's windup and recovery are the common enemies'
// And PROVISIONAL until measured, the wiki Giving no timings
export const INIQUITOUS_BAPTIST_MOVES: BossMove[] = [
  {
    atkPercent: 200,
    name: "Elemental Rings",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Phase Cycle",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 78,
    element: Element.Cryo,
    name: "Dark Frost Icicles",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 70,
    element: Element.Cryo,
    name: "Icy Blades",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Cryo,
    name: "Shattering Blast",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Electro,
    name: "Abyssal Light",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Electro,
    name: "Violet Beam",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 70,
    element: Element.Electro,
    name: "Lances of Retribution",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 70,
    element: Element.Hydro,
    name: "Surging Tide",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Hydro,
    name: "Orbs of Cleansing",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Pyro,
    name: "Searing Precept",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Pyro,
    name: "Orbs of Incineration",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The seconds the first or second shield is given before Phase Cycle's orbs detonate, 30 by the wiki, not yet run
export const INIQUITOUS_BAPTIST_EARLY_SHIELD_SECONDS = 30;
// The seconds the third shield onwards is given before Elemental Rings, 25 by the wiki, not yet run
export const INIQUITOUS_BAPTIST_LATE_SHIELD_SECONDS = 25;
// The Cryo shield's durability in gauge units, 12 by the wiki, halved up to twice in the overworld, not yet run
export const INIQUITOUS_BAPTIST_CRYO_SHIELD_GAUGE_UNITS = 12;
// The Electro shield's durability in gauge units, 8 by the wiki, halved up to twice in the overworld, not yet run
export const INIQUITOUS_BAPTIST_ELECTRO_SHIELD_GAUGE_UNITS = 8;
// The Hydro shield's durability in gauge units, 12 by the wiki, halved up to twice in the overworld, not yet run
export const INIQUITOUS_BAPTIST_HYDRO_SHIELD_GAUGE_UNITS = 12;
// The Pyro shield's durability in gauge units, 12 by the wiki, halved up to twice in the overworld, not yet run
export const INIQUITOUS_BAPTIST_PYRO_SHIELD_GAUGE_UNITS = 12;
