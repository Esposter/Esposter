import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "@/services/exec/snapshot/buildHostFlushPlan";
// Reconcile a persist run's overlay upper onto the host (specs/write-back.md): build the plan, then apply it.
// PersistRun inlines the two halves so it can reuse the plan for the task cache; this is the single-call entry point.
// `outputDirs` (an environment's prepare outputs) are masked from the flush like node_modules — cache-owned, not host.
export const flushUpperToHost = (
  upperDir: string,
  hostDir: string,
  snapshotUpperDir: string,
  outputDirs: readonly string[] = [],
): void =>{  applyFlushPlan(upperDir, hostDir, buildHostFlushPlan(upperDir, snapshotUpperDir, outputDirs)); };
