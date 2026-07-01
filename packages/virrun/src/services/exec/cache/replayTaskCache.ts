import type { ExecResult } from "@/models/exec/ExecResult";

import { parseTaskCacheEntry } from "@/services/exec/cache/parseTaskCacheEntry";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { readFileSync } from "node:fs";
// Replay a task-cache hit: reconcile the recorded payload onto the host exactly as the original write-back did, then
// Return the recorded outcome. The observable result — files, streams, exit code — is identical to re-running, the
// Correctness contract the differential/equivalence tests hold it to.
export const replayTaskCache = (key: string, hostDir: string): ExecResult => {
  const location = resolveTaskCacheLocation(key);
  const entry = parseTaskCacheEntry(readFileSync(location.metaFile, "utf8"));
  applyFlushPlan(location.payloadDir, hostDir, entry.plan);
  return { exitCode: entry.exitCode, stderr: entry.stderr, stdout: entry.stdout };
};
