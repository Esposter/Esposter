import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { FlushOp } from "@/models/exec/FlushOp";

import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "@/services/exec/snapshot/buildHostFlushPlan";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
// Run a command over the warm snapshot with a persistable upper, then flush that upper to the host on a clean exit
// Only (all-or-nothing; specs/write-back.md). The persist sibling of forkSnapshot: same read-only snapshot lower, so
// Node_modules is never in the upper and never flushed. Requires a captured snapshot; the temp upper/work are always
// Torn down. `onPersist` fires after the host flush with the still-live upper and the built plan, so the task cache
// Can record the output diff without re-probing (persistWithCache).
export const persistRun = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
  onPersist?: (upperDir: string, plan: readonly FlushOp[], result: ExecResult) => void,
): Promise<ExecResult> => {
  const { dir, exists, upperDir } = resolveSnapshotLocation(options.cwd);
  if (!exists)
    throw new InvalidOperationError(
      Operation.Read,
      persistRun.name,
      "no captured snapshot to persist over; provision one first",
    );
  const hostDir = options.cwd === "" ? process.cwd() : options.cwd;
  const persistUpperDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.`));
  const persistWorkDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.`));
  return withFinalizerAsync(
    async () => {
      const result = await backend.exec(command, {
        ...options,
        overlayLayers: { lowerDirs: [upperDir], upperDir: persistUpperDir, workDir: persistWorkDir },
      });
      if (result.exitCode === 0) {
        // Build the plan once: apply to the host, then hand the same plan to onPersist so the task cache records the
        // Diff without a second Linux-side probe.
        const plan = buildHostFlushPlan(persistUpperDir, upperDir);
        applyFlushPlan(persistUpperDir, hostDir, plan);
        onPersist?.(persistUpperDir, plan, result);
      }
      return result;
    },
    () => {
      removeSnapshotDirectory(persistUpperDir);
      removeSnapshotDirectory(persistWorkDir);
    },
  );
};
