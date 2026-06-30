import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { flushUpperToHost } from "@/services/exec/snapshot/flushUpperToHost";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
// Run a command over the warm snapshot with a persistable upper, then flush that upper to the host (specs/
// Write-back.md). The persist sibling of forkSnapshot: same read-only snapshot lower — so node_modules is never in
// The upper and never flushed — but a real upper whose diff is reconciled onto the host, on a clean exit only
// (all-or-nothing). Requires a captured snapshot. The per-pid temp upper/work are throwaway, torn down always.
export const persistRun = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
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
      if (result.exitCode === 0) flushUpperToHost(persistUpperDir, hostDir, upperDir);
      return result;
    },
    () => {
      removeSnapshotDirectory(persistUpperDir);
      removeSnapshotDirectory(persistWorkDir);
    },
  );
};
