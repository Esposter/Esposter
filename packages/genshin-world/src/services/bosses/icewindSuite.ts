import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Icewind Suite's attacks from its wiki page, in the order the page lists them. The page gives two challenges,
// Dirge of Coppelia and Nemesis of Coppelius, chosen in dialogue with Maillardet, and lists each one's attacks in turn,
// So both sets sit here until a fight is given its challenge. Double Spin is the same in both and is listed once. Each
// Climax is a phase, not an attack: its sequences are unnamed, its Whirlwinds of Dirge wait on the scene export's wind
// Current, and its retributive Frosthearts are summons not yet run. Each move's windup and recovery are the common
// Enemies' and are PROVISIONAL until measured
export const ICEWIND_SUITE_MOVES: BossMove[] = [
  // Both challenges use it, dealing 60% ATK as Anemo DMG and Cryo DMG. A move carries one element, so Anemo is set
  {
    atkPercent: 60,
    element: Element.Anemo,
    name: "Double Spin",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Cryo,
    name: "Stationary Lift",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Cryo,
    name: "Glacial Flourish",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    element: Element.Cryo,
    name: "Shard Spray",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Five spins of 30% ATK each, so the largest hit is 30
  {
    atkPercent: 30,
    element: Element.Anemo,
    name: "Death Spiral",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its 60% ATK is the landing. The returning spin hits for 15% ATK every 0.3s, a lingering effect not yet run
  {
    atkPercent: 60,
    element: Element.Anemo,
    name: "Throw Jump",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 75,
    element: Element.Anemo,
    name: "Salchow Jump",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The share of its max HP at which the duo starts a Climax, from both challenges' Climax entries. Not yet run
export const ICEWIND_SUITE_CLIMAX_HEALTH_PERCENT = 71;
// The seconds since the fight or the last Climax at which the duo starts a Climax, from the same entries. Not yet run
export const ICEWIND_SUITE_CLIMAX_SECONDS = 30;
// The Pneuma (Dirge of Coppelia) or Ousia (Nemesis of Coppelius) hits that interrupt a Climax and stun the duo. Not yet
// Run
export const ICEWIND_SUITE_CLIMAX_INTERRUPT_HIT_COUNT = 3;
// Nemesis of Coppelius only: the seconds into its Climax before the duo gains a Frozen shield. Not yet run
export const ICEWIND_SUITE_NEMESIS_CLIMAX_SHIELD_SECONDS = 8;
// Nemesis of Coppelius only: the seconds between its Climax's later Frozen shields respawning. Not yet run
export const ICEWIND_SUITE_NEMESIS_CLIMAX_SHIELD_RESPAWN_SECONDS = 16;
