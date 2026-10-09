import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  MAIN_BRANCH,
  MOVED_BRANCH_RETRY_DELAY_SECONDS,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";

// The verdict of a push refused because the branch moved under the run: nothing was written, and the next run re-reads
// The remote and measures again. A push to `main` or `ai/queue` fires that run itself (`ReviewCollector.yaml`); one to
// `develop`, `ai/review-fixes` or a window's branch fires none, so the run wakes itself a minute later
export const getMovedOutcome = (branch: string): CycleOutcome => ({
  kind: CycleOutcomeKind.Idle,
  reason: `${branch} moved during the run — nothing pushed, the next run re-measures`,
  ...(branch === MAIN_BRANCH || branch === QUEUE_BRANCH
    ? {}
    : { retriggerDelaySeconds: MOVED_BRANCH_RETRY_DELAY_SECONDS }),
});
