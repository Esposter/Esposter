import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// The lane either ends the run on its push or hands back what it could not cut, so the pass can say so rather
// Than report a synced queue over a claimed commit nothing carries
export interface ExpressLaneResult {
  // The queue commits claiming no review that did not reach `main` this run and were not parked: a patch that does not
  // Apply yet with attempts left (`settleUnappliedClaims`), or a `main` that moved under the push
  heldShas: string[];
  outcome?: CycleOutcome;
}
