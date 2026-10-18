import type { StormterrorFight } from "#src/models/bosses/StormterrorFight";

import { checkIsStormterrorPhaseOver } from "#src/services/bosses/checkIsStormterrorPhaseOver";
import { STORMTERROR_PHASES } from "#src/services/bosses/stormterror";

// The fight as it begins: the first phase, with no time spent in it and no shield broken
export const STORMTERROR_FIGHT_START: StormterrorFight = { phase: 1, phaseElapsedSeconds: 0, totalShieldBreaks: 0 };

// Steps the fight by the time that passed and the shield breaks since, moving it on from each phase that is over. Each phase it
// Leaves names the transition attack Dvalin performs as it ends, in the order they happen
export const stepStormterrorFight = (
  fight: StormterrorFight,
  elapsedSeconds: number,
  shieldBreaks: number,
): { fight: StormterrorFight; transitionAttacks: string[] } => {
  let phase = fight.phase;
  let phaseElapsedSeconds = fight.phaseElapsedSeconds + elapsedSeconds;
  const totalShieldBreaks = fight.totalShieldBreaks + shieldBreaks;
  const transitionAttacks: string[] = [];
  let phaseRow = STORMTERROR_PHASES[phase - 1];
  while (
    phaseRow !== undefined &&
    checkIsStormterrorPhaseOver(phaseRow, { phase, phaseElapsedSeconds, totalShieldBreaks })
  ) {
    if (phaseRow.transitionAttack !== undefined) transitionAttacks.push(phaseRow.transitionAttack);
    phase += 1;
    phaseElapsedSeconds = 0;
    phaseRow = STORMTERROR_PHASES[phase - 1];
  }
  return { fight: { phase, phaseElapsedSeconds, totalShieldBreaks }, transitionAttacks };
};
