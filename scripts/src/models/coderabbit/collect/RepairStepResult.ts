import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What the repair step hands the pass: the verdict a repair it pushed ends the run with, and the wake a signature past
// Its repairs is owed once its oldest attempt ages out of the span — or neither, which leaves the pass's own standing
export interface RepairStepResult {
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
}
