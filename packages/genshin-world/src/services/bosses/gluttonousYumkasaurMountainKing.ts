import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Gluttonous Yumkasaur Mountain King's attacks from its wiki page, in the order the page lists them
// The wiki gives no timings, so each move's windup and recovery are the common enemies', PROVISIONAL until measured
export const GLUTTONOUS_YUMKASAUR_MOUNTAIN_KING_MOVES: BossMove[] = [
  {
    atkPercent: 50,
    element: Element.Dendro,
    name: "Spit",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Dendro,
    name: "Stomp",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 65,
    element: Element.Dendro,
    name: "Tail Smash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Dendro,
    name: "Hanging Drop",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 80,
    element: Element.Dendro,
    name: "Swinging Slam",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Its arena-edge use, which turns it towards the centre, waits on the scene export for the arena's edge
  {
    atkPercent: 35,
    element: Element.Dendro,
    name: "Belly Spin",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The ignited explosion leaves burning ground, a lingering effect that is not run yet
  {
    atkPercent: 100,
    element: Element.Pyro,
    name: "Single Flamegranate Spit",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // The count of Flamegranates devoured, which sets how many of its three attacks run, is not run yet
  // Each explosion's burning ground, and the longer paralysis when all three explode, are not run yet
  // The Spiral Abyss and Story opening, which runs the three Pyro attacks with no Flamegranates, is a mode not yet run
  {
    atkPercent: 250,
    element: Element.Pyro,
    name: "Triple Flamegranate Spit",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
