import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// Stormterror's moves from the wiki's Stormterror Dvalin page, as a stand-in set until a recording measures it: the
// Moves whose damage the wiki gives as a share of ATK, in the order it lists them. Caelestinum Finale Termini gives no
// Share, so it is left out, and the paralysing shield is not an attack. Each move's windup and recovery are the common
// Enemies' until measured
export const STORMTERROR_MOVES: BossMove[] = [
  { atkPercent: 100, name: "Fly-By", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  {
    atkPercent: 50,
    element: Element.Anemo,
    hitIntervalSeconds: 0.5,
    name: "Dvalin's Cleansing",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 100,
    name: "Lacerating Slash",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Tempestuous Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 200,
    name: "Rending Vortex",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Anemo,
    name: "Energy Lightning",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];
