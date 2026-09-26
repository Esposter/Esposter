import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// The step either ends the run — nothing may be ported ahead of findings still open — or hands back the fixes
// Branch the port reads, which is the sha it started with when nothing was drained
export interface DrainStepResult {
  outcome?: CycleOutcome;
  reviewFixesSha?: string;
}
