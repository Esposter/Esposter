import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Secret Source Automaton: Configuration Device's attacks from its wiki page, in the order the page lists them
// The wiki gives no timings, so each move's windup and recovery are the common enemies', PROVISIONAL until measured
// The Stygian Onslaught Fearless and Dire variant is a mode of its own that changes three of these attacks
// It also gives the boss a ward. Its changes and ward are not run yet, so each percent here is the base form's
export const SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_MOVES: BossMove[] = [
  // The gauge that fills from Nightsoul's Blessing is not run yet
  // Its laser sweeps fire once the gauge reaches the constant below
  {
    atkPercent: 30,
    element: Element.Electro,
    name: "Adaptive Countermeasures",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The variant's electrified ground, a lingering effect, is not run yet
  {
    atkPercent: 70,
    element: Element.Electro,
    name: "Triple Airstrike",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    element: Element.Electro,
    name: "Laser Sweep",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its cancel into Dragonclaw when the player comes too close is not run yet
  {
    atkPercent: 40,
    element: Element.Electro,
    name: "Tracking Beam",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The variant's follow-up lasers and explosion are not run yet, so this is the base form's largest hit
  {
    atkPercent: 60,
    element: Element.Electro,
    name: "Dragonclaw",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    element: Element.Electro,
    name: "Claw and Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The Accretion Mechanisms atop the Solid Phlogiston pillars wait on the scene export
  // The interruption when both are destroyed waits on that export too
  // The ground the charge electrifies is a lingering effect, not run yet
  // The wiki gives no time after which the charge starts without a full gauge, so that trigger is not run yet
  {
    atkPercent: 200,
    element: Element.Electro,
    name: "Boltsphere Cannon",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The points the Adaptive Countermeasures gauge holds when it is full, at which its sweeps fire, is not yet run
export const SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_ADAPTIVE_COUNTERMEASURES_FULL_POINTS = 200;
// The share of its max HP the Stygian Onslaught variant's ward is, which breaks at the full gauge, is not yet run
export const SECRET_SOURCE_AUTOMATON_CONFIGURATION_DEVICE_STYGIAN_WARD_HEALTH_PERCENT = 200;
