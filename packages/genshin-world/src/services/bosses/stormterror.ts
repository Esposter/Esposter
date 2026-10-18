import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// Stormterror's moves from the wiki's Stormterror Dvalin page, as a stand-in set until a recording measures it: the moves
// Whose damage the wiki gives as a share of ATK, in the order it lists them. Caelestinum Finale Termini gives no share, so it
// Is left out, and the paralysing shield is not an attack. Each move's windup and recovery are the common enemies' until measured
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

// The phases of the fight from the wiki's Stormterror Dvalin page, each with its shield's time limit and the number of shield
// Breaks that end it, and the attack that transitions into the next phase. The fifth phase lasts to the fight's end. Timings
// Its timings are PROVISIONAL, read from the page, which cites the speedrun recording "Confront Stormterror - Speedrun Strategy & Exploits"
// (youtu.be/j62DdUZXczM) and is not measured in a recording of this game yet
export interface StormterrorPhase {
  phase: number;
  shieldLimit: number;
  timeLimitSeconds: number;
  transitionAttack?: string;
}

export const STORMTERROR_PHASES: readonly StormterrorPhase[] = [
  { phase: 1, shieldLimit: 1, timeLimitSeconds: 120, transitionAttack: "Caelestinum Finale Termini" },
  { phase: 2, shieldLimit: 3, timeLimitSeconds: 480, transitionAttack: "Caelestinum Finale Termini" },
  { phase: 3, shieldLimit: 5, timeLimitSeconds: 120, transitionAttack: "Energy Lightning" },
  { phase: 4, shieldLimit: 6, timeLimitSeconds: 480, transitionAttack: "Caelestinum Finale Termini" },
  { phase: 5, shieldLimit: Number.POSITIVE_INFINITY, timeLimitSeconds: Number.POSITIVE_INFINITY },
];

// Dvalin's shield, which each phase's breaks count against: non-elemental and a fifth of his max HP, from the same page. Once it
// Breaks he is paralysed on the platform for a long period the wiki does not time, which ends early when the player falls out of
// Bounds (PROVISIONAL)
export const STORMTERROR_SHIELD_HP_FRACTION = 0.2;

// The arena's wind currents from the same page: Anemograna's updrafts, which a character rides to dodge Dvalin's attacks or to
// Crossing between platforms. Their positions are the scene export's and not read here, so each is named and not placed (PROVISIONAL)
export const STORMTERROR_WIND_CURRENTS = [{ name: "Anemograna's updraft", source: "Anemograna" }] as const;
