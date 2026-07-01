import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "@/services/exec/snapshot/buildHostFlushPlan";
// Reconcile a persist run's overlay upper onto the host (specs/write-back.md): build the plan, then apply it.
// PersistRun inlines the two halves so it can reuse the plan for the task cache; this is the single-call entry point.
export const flushUpperToHost = (upperDir: string, hostDir: string, snapshotUpperDir: string): void =>
  applyFlushPlan(upperDir, hostDir, buildHostFlushPlan(upperDir, snapshotUpperDir));
