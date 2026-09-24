import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// The step either ends the run — a conflict nothing resolved, or a branch that moved under it — or hands back the
// Fixes branch the sync and the port read, which is the sha it started with when it already sat on develop
export interface SyncFixesResult {
  outcome?: CycleOutcome;
  owingFixesSha: string;
}
