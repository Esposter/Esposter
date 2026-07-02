import type { ExecResult } from "@/models/exec/ExecResult";
import type { FlushOp } from "@/models/exec/FlushOp";
import type { TaskCacheEntry } from "@/models/exec/cache/TaskCacheEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { TASK_CACHE_META_FILENAME, TASK_CACHE_PAYLOAD_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getResult } from "@esposter/shared";
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
    tempDir = mkdtempSync(join(tasksRoot, `${key}.`));
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
    }).match(
      () => undefined,
      (error) => {
        // A race-loser renames onto a populated dir and fails; keep the winner's entry and drop our temp.
        if (!existsSync(location.metaFile)) throw error;
        removeSnapshotDirectory(tempDir);
      },
    );
  }).match(
    () => undefined,
    () => {
      if (tempDir) removeSnapshotDirectory(tempDir);
    },
  );
};
