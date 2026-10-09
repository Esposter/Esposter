import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What the repair step hands the pass: the verdict a repair it pushed ends the run with, and the wake a red it held or
// Gave up on is owed — the queue's run over the head concluding, or a signature's oldest attempt ageing out of the
// Span — or neither, which leaves the pass's own standing
export interface RepairStepResult {
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
}
