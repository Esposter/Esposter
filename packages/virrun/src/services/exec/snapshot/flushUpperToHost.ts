import { applyFlushPlan } from "#src/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "#src/services/exec/snapshot/buildHostFlushPlan";
// Reconcile a persist run's overlay upper onto the host (specs/write-back.md): build the plan, then apply it.
// `persistRun` inlines the two halves so it can reuse the plan for the task cache; this is the single-call entry point.
// `maskedPaths` (an environment's prepare outputs, plus the source-mirror excludes on win32) are masked from the
// Flush like node_modules — owned by a layer or by the host alone, never written back from the sandbox.
export const flushUpperToHost = (
  upperDir: string,
  hostDir: string,
  snapshotUpperDir: string,
  maskedPaths: readonly string[] = [],
): void => {
  applyFlushPlan(upperDir, hostDir, buildHostFlushPlan(upperDir, snapshotUpperDir, maskedPaths));
};
