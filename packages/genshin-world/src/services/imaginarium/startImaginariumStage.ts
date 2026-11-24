import type { DomainChallengeProgress } from "#src/models/domains/DomainChallengeProgress";
import type { ImaginariumRun } from "#src/models/imaginarium/ImaginariumRun";
import type { ImaginariumStageFight } from "#src/models/imaginarium/ImaginariumStageFight";

import { fightImaginariumStage } from "#src/services/imaginarium/fightImaginariumStage";
import { rewindImaginariumRun } from "#src/services/imaginarium/rewindImaginariumRun";

// A stage a run starts: fought when its Principal Cast is ready, and otherwise the run rewinds to its last boss stage,
// Which spends one of its rewinds, or stays as it was when it holds none
export const startImaginariumStage = (
  run: ImaginariumRun,
  progress: DomainChallengeProgress,
  isPartyDown: boolean,
): { fight: ImaginariumStageFight; run: ImaginariumRun } => {
  const fight = fightImaginariumStage(run.principalCast, progress, isPartyDown);
  return fight.isFought
    ? { fight, run: { ...run, principalCast: fight.principalCast } }
    : { fight, run: rewindImaginariumRun(run) };
};
