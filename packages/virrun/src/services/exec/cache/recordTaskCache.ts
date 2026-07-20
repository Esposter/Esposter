import type { TaskCacheEntry } from "@/models/exec/cache/TaskCacheEntry";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { FlushOp } from "@/models/exec/FlushOp";

import { FlushOpType } from "@/models/exec/FlushOp";
import { writeVirrunDebug } from "@/services/cli/debug/writeVirrunDebug";
import {
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_PAYLOAD_DIRECTORY_NAME,
  TASK_CACHE_TEMP_PREFIX,
} from "@/services/exec/cache/constants";
import { pruneStaleTaskCacheEntries } from "@/services/exec/cache/pruneStaleTaskCacheEntries";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { reapStaleTemps } from "@/services/exec/snapshot/reapStaleTemps";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { withPidTempPrefix } from "@/services/exec/util/withPidTempPrefix";
import { getResult, noop } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
// Record one exit-0 persist run so an identical later run replays instead of re-executing (replayTaskCache). The
// Persist upper IS the output diff: materialize just the copy-op payload into the entry (deletes carry no payload;
// Replay recreates them from the plan), then write the meta. Atomic publish mirrors createSnapshot — build in a temp,
// Then a single renameSync promotes it — so a concurrent recorder never reads a half-built entry and a race-loser
// Keeps the winner's. Best-effort: any failure tears down the temp and leaves the run correct, merely uncached.
export const recordTaskCache = (key: string, upperDir: string, plan: readonly FlushOp[], result: ExecResult): void => {
  const location = resolveTaskCacheLocation(key);
  // Already recorded by a prior or concurrent run — nothing to do.
  if (location.exists) return;
  let tempDir = "";
  getResult(() => {
    const tasksRoot = dirname(location.dir);
    mkdirSync(tasksRoot, { recursive: true });
    // Reclaim any hard-killed recorder's pid-tagged temp stranded here (no other sweep touches the tasks dir), then
    // Mint this run's own — pid-tagged so a concurrent recorder's live temp is never mistaken for a corpse.
    reapStaleTemps(tasksRoot, [TASK_CACHE_TEMP_PREFIX]);
    // Age-prune published entries beside the temp reap — the tasks dir has no superseded-entry sweep, so recency is
    // The only bound. Detached and best-effort; a torn removal is re-swept next record and never aborts this run.
    pruneStaleTaskCacheEntries(tasksRoot);
    tempDir = mkdtempSync(join(tasksRoot, withPidTempPrefix(TASK_CACHE_TEMP_PREFIX)));
    const payloadDir = join(tempDir, TASK_CACHE_PAYLOAD_DIRECTORY_NAME);
    mkdirSync(payloadDir, { recursive: true });
    applyFlushPlan(
      upperDir,
      payloadDir,
      plan.filter((op) => op.type === FlushOpType.Copy),
    );
    const entry: TaskCacheEntry = { exitCode: result.exitCode, plan, stderr: result.stderr, stdout: result.stdout };
    writeFileSync(join(tempDir, TASK_CACHE_META_FILENAME), JSON.stringify(entry));
    getResult(() => {
      renameSync(tempDir, location.dir);
    }).match(noop, (error) => {
      // A race-loser renames onto a populated dir and fails; keep the winner's entry and drop our temp.
      if (!existsSync(location.metaFile)) throw error;
      removeSnapshotDirectory(tempDir);
    });
  }).match(noop, (error) => {
    writeVirrunDebug(`task cache record failed — ${error.message}`);
    if (tempDir) removeSnapshotDirectory(tempDir);
  });
};
