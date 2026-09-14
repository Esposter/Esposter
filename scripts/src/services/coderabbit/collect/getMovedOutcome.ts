import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";

// The verdict of a push refused because the branch moved under the run: nothing was written, and the next event
// Re-reads the remote and measures again
export const getMovedOutcome = (branch: string): CycleOutcome => ({
  kind: CycleOutcomeKind.Idle,
  reason: `${branch} moved during the run — nothing pushed, the next run re-measures`,
});
