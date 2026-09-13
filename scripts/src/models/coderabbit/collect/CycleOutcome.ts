import type { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";

// The whole verdict of one pass. A dry run reports the act it stopped in front of as the outcome it would have
// Reached, which is what lets the same pass answer both modes without a second exit path per write.
export interface CycleOutcome {
  kind: CycleOutcomeKind;
  reason: string;
  // Seconds the runner's retrigger job sleeps before dispatching the cycle again. Set from the gate down
  // Whatever the run goes on to do: a stated deadline is owed a wake whether or not a window was pushed.
  retriggerDelaySeconds?: number;
  // What was pushed, on `Expressed` and `Pushed`
  targetSha?: string;
}
