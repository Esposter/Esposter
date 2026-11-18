import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Maguu Kenki's attacks from its wiki page, in the order the page lists them: the unconditional ones, then those
// Used above 71% health, then those used at 71% health or lower. Oushi no Omote, Dash and Taunt deal no damage, so
// They are not moves. The Warrior's Spirit block is the event boss Maguu Kengou, a separate enemy, so it is not here.
// The phase-one moves are gated by being above the health share exported below, and the phase-two moves by being at or
// Under it, neither run yet. PROVISIONAL: the wiki gives no timings, so each move's windup and recovery are the common
// Enemies' until measured
export const MAGUU_KENKI_MOVES: BossMove[] = [
  {
    atkPercent: 100,
    element: Element.Anemo,
    name: "Pushing Mask",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    element: Element.Cryo,
    name: "Exploding Mask",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  { atkPercent: 50, name: "Ichimonji", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 60,
    name: "Iai: Shadowrush",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Pseudo Tengu Sweeper",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The wiki gives the Anemo and Cryo hits as landing together, so the element is the first named
  {
    atkPercent: 80,
    element: Element.Anemo,
    name: "Dual Sword Burst",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Blustering Blade",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 60,
    element: Element.Anemo,
    name: "Iai: Shadowrush (Enhanced)",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Shadowsword: Ichimonji",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Both hits of its first variant reach 100, one Anemo and one Cryo, so the element is the first named
  {
    atkPercent: 100,
    element: Element.Anemo,
    name: "Shadowsword: Pseudo Tengu Sweeper",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The wiki gives no share for this one, so it takes the 50% of the Blustering Blade it repeats
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Shadowsword: Blustering Blade",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
// The share of its health at which it performs Dual Sword Burst and turns to phase two, whose mechanic is not yet run
export const MAGUU_KENKI_PHASE_TWO_HEALTH_PERCENT = 71;
// The share of its health it cannot be damaged past while it performs Dual Sword Burst, whose mechanic is not yet run
export const MAGUU_KENKI_PHASE_TRANSITION_HEALTH_FLOOR_PERCENT = 70;
