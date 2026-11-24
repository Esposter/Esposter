import type { PerpetualMechanicalArrayFight } from "#src/models/bosses/PerpetualMechanicalArrayFight";
import type { PerpetualMechanicalArrayMode } from "#src/models/bosses/PerpetualMechanicalArrayMode";

import { PerpetualMechanicalArrayMode as Mode } from "#src/models/bosses/PerpetualMechanicalArrayMode";
import {
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH,
  PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS,
  PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS,
} from "#src/services/bosses/constants";

// The fight as it begins: attacking, with no time spent and Defensive Mode not yet triggered
export const PERPETUAL_MECHANICAL_ARRAY_FIGHT_START: PerpetualMechanicalArrayFight = {
  fightSeconds: 0,
  isDefensiveModeTriggered: false,
  mode: Mode.Attacking,
  modeSeconds: 0,
};

interface ModeTransition {
  // The seconds past the mode's end that carry into the mode it enters
  carriedSeconds: number;
  mode: PerpetualMechanicalArrayMode;
}

// The mode the fight moves into next, if its current one is over. A disabled sentinel paralyses the boss in Defensive
// Mode before its exit time is read, and each mode's seconds carry past its end into the next, so one long step crosses
// Several
const computeModeTransition = (
  { fightSeconds, isDefensiveModeTriggered, mode, modeSeconds }: PerpetualMechanicalArrayFight,
  healthFraction: number,
  isSentinelDisabled: boolean,
): ModeTransition | undefined => {
  if (mode === Mode.Attacking) {
    const isTimedActivation = fightSeconds >= PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS;
    if (
      isDefensiveModeTriggered ||
      (!isTimedActivation && healthFraction > PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_HEALTH)
    )
      return undefined;
    return {
      carriedSeconds: Math.max(0, fightSeconds - PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_SECONDS),
      mode: Mode.DefensiveMode,
    };
  }
  if (mode === Mode.DefensiveMode) {
    if (isSentinelDisabled) return { carriedSeconds: 0, mode: Mode.Paralysed };
    if (modeSeconds >= PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS)
      return {
        carriedSeconds: modeSeconds - PERPETUAL_MECHANICAL_ARRAY_DEFENSIVE_MODE_EXIT_SECONDS,
        mode: Mode.Attacking,
      };
    return undefined;
  }
  if (mode === Mode.Paralysed && modeSeconds >= PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS)
    return { carriedSeconds: modeSeconds - PERPETUAL_MECHANICAL_ARRAY_PARALYSIS_SECONDS, mode: Mode.Invulnerable };
  if (mode === Mode.Invulnerable && modeSeconds >= PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS)
    return { carriedSeconds: modeSeconds - PERPETUAL_MECHANICAL_ARRAY_INVULNERABLE_SECONDS, mode: Mode.Attacking };
  return undefined;
};

// Steps the fight by the time that passed, the boss's health as a share of its max and whether its highlighted sentinel
// Has been disabled since. It returns the fight and the modes it entered, in order, so the arena starts and stops what
// Each one brings: the boss attacks only while Attacking, and its attack pattern starts again from its first move when
// Attacking resumes
export const stepPerpetualMechanicalArrayFight = (
  fight: PerpetualMechanicalArrayFight,
  elapsedSeconds: number,
  healthFraction: number,
  isSentinelDisabled: boolean,
): { fight: PerpetualMechanicalArrayFight; modesEntered: PerpetualMechanicalArrayMode[] } => {
  const current: PerpetualMechanicalArrayFight = {
    ...fight,
    fightSeconds: fight.fightSeconds + elapsedSeconds,
    modeSeconds: fight.modeSeconds + elapsedSeconds,
  };
  const modesEntered: PerpetualMechanicalArrayMode[] = [];
  let transition = computeModeTransition(current, healthFraction, isSentinelDisabled);
  while (transition !== undefined) {
    if (transition.mode === Mode.DefensiveMode) current.isDefensiveModeTriggered = true;
    current.mode = transition.mode;
    current.modeSeconds = transition.carriedSeconds;
    modesEntered.push(transition.mode);
    transition = computeModeTransition(current, healthFraction, isSentinelDisabled);
  }
  return { fight: current, modesEntered };
};
