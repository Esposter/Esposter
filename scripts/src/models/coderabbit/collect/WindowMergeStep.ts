import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What merging the bottom window hands the walk: the run ends with the outcome, or the window is merged and drained
// And the fixes branch the drain left is carried on
export interface WindowMergeStep {
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
  reviewFixesSha?: string;
}
