import type { ImaginariumRun } from "#src/models/imaginarium/ImaginariumRun";

import { IMAGINARIUM_REWIND_COST } from "#src/services/imaginarium/constants";
import { spendImaginariumCount } from "#src/services/imaginarium/spendImaginariumCount";

// The run after a rewind to the end of its last boss stage: its Principal Cast as the checkpoint kept it, and one rewind
// Spent. A run with no rewinds left is refused and keeps its cast
export const rewindImaginariumRun = (run: ImaginariumRun): ImaginariumRun => {
  const { count, isSpent } = spendImaginariumCount(run.rewinds, IMAGINARIUM_REWIND_COST);
  return isSpent ? { ...run, principalCast: run.checkpoint, rewinds: count } : run;
};
