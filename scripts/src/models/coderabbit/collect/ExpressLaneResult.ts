import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// The lane either ends the run on its push or hands back what it could not cut, so the pass can say so rather
// Than report a synced queue over a claimed commit nothing carries
export interface ExpressLaneResult {
  // The queue commits claiming no review that reached `main` on neither a cut nor this run: the cut is red, or
  // `main` itself is and the repair went first
  heldShas: string[];
  outcome?: CycleOutcome;
}
