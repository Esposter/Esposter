import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { ExecResult } from "#src/models/exec/ExecResult";
import type { FlushOp } from "#src/models/exec/FlushOp";

import { applyFlushPlan } from "#src/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "#src/services/exec/snapshot/buildHostFlushPlan";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "#src/services/exec/snapshot/constants";
import { removeSnapshotDirectoryBestEffort } from "#src/services/exec/snapshot/removeSnapshotDirectoryBestEffort";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { withPidTempPrefix } from "#src/services/exec/util/withPidTempPrefix";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
// Run a command over the warm snapshot with a persistable upper, then flush that upper to the host whatever the exit
// Code (native-equivalence; specs/write-back.md) — a non-zero mutation still wrote real files. The persist sibling of
// ForkSnapshot: the deps snapshot (and any
// `extraLowerDirs`, e.g. the prepare layer) stack as read-only lowers, so node_modules is never in the upper and
// Never flushed. `maskedPaths` (an environment's prepare outputs, e.g. `.nuxt`, plus the source-mirror excludes on
// Win32) are masked from the flush like node_modules — owned by a layer or by the host alone, so a persist run never
// Writes them back (checkIsUnderSnapshotLower). Requires a captured snapshot; the
// Temp upper/work are always torn down. `onPersist` fires after the host flush with the still-live upper and the
// Built plan (only on a clean exit — a failed run is flushed but never cached), so the task cache can record the
// Output diff without re-probing (persistWithCache).
export const persistRun = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
  extraLowerDirs: readonly string[] = [],
  maskedPaths: readonly string[] = [],
  onPersist?: (upperDir: string, plan: readonly FlushOp[], result: ExecResult) => void,
): Promise<ExecResult> => {
  const { dir, exists, upperDir } = resolveSnapshotLocation(options.cwd);
  if (!exists)
    throw new InvalidOperationError(
      Operation.Read,
      persistRun.name,
      "no captured snapshot to persist over; provision one first",
    );
  const hostDir = options.cwd || process.cwd();
  const persistUpperDir = mkdtempSync(join(dir, withPidTempPrefix(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.`)));
  const persistWorkDir = mkdtempSync(join(dir, withPidTempPrefix(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.`)));
  return withFinalizerAsync(
    async () => {
      const result = await backend.exec(command, {
        ...options,
        overlayLayers: { lowerDirs: [upperDir, ...extraLowerDirs], upperDir: persistUpperDir, workDir: persistWorkDir },
      });
      // Build the plan once and always flush it, whatever the exit code: native-equivalence taken literally means the
      // Host is left exactly as the tool left it, and a mutation tool that exits non-zero (eslint --fix / oxfmt with
      // Remaining unfixable errors, a build that half-writes dist/) still wrote real files that must reach the host.
      const plan = buildHostFlushPlan(persistUpperDir, upperDir, maskedPaths);
      applyFlushPlan(persistUpperDir, hostDir, plan);
      // Only a clean exit is recorded to the task cache — replaying a failed run would skip a genuine re-attempt — but
      // The same plan is reused so the cache records the output diff without a second Linux-side probe.
      if (result.exitCode === 0) onPersist?.(persistUpperDir, plan, result);
      return result;
    },
    () => {
      removeSnapshotDirectoryBestEffort(persistUpperDir);
      removeSnapshotDirectoryBestEffort(persistWorkDir);
    },
  );
};
