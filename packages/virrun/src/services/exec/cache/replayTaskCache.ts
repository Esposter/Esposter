import type { ExecResult } from "#src/models/exec/ExecResult";

import { parseTaskCacheEntry } from "#src/services/exec/cache/parseTaskCacheEntry";
import { resolveTaskCacheLocation } from "#src/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "#src/services/exec/snapshot/applyFlushPlan";
import { getResult, noop } from "@esposter/shared";
import { readFileSync, utimesSync } from "node:fs";
// Replay a task-cache hit: reconcile the recorded payload onto the host exactly as the original write-back did, then
// Return the recorded outcome. The observable result — files, streams, exit code — is identical to re-running, the
// Correctness contract the differential/equivalence tests hold it to.
export const replayTaskCache = (key: string, hostDir: string): ExecResult => {
  const location = resolveTaskCacheLocation(key);
  const entry = parseTaskCacheEntry(readFileSync(location.metaFile, "utf8"));
  // Bump the meta mtime so the age-prune (pruneStaleTaskCacheEntries) measures recency of use, not creation — a hot
  // Entry stays live however old it is. Best-effort: a failed touch only risks an earlier prune, i.e. one re-run.
  const now = new Date();
  getResult(() => {
    utimesSync(location.metaFile, now, now);
  }).match(noop, noop);
  applyFlushPlan(location.payloadDir, hostDir, entry.plan);
  return { exitCode: entry.exitCode, stderr: entry.stderr, stdout: entry.stdout };
};
