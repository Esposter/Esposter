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
// Run a command over the warm snapshot with a PERSISTABLE upper, then flush that upper back to the host working dir
// So the on-disk result matches native (specs/write-back.md). The persist sibling of forkSnapshot: forkSnapshot
// Stacks the snapshot read-only and lets writes vanish (verification/CI); persistRun stacks it read-only too but
// Tops it with a real upper whose post-command diff is reconciled onto the host. node_modules lives in the RO
// Snapshot lower, so the command's upper only ever holds writes beyond the warm baseline (dist, migrations, fixed
// Src) — node_modules is structurally never flushed. Requires a captured snapshot (the caller provisions one first,
// Like Virrun.fork), so persistRun never silently runs without the deps it stacks.
//
// All-or-nothing: the flush runs only on a clean exit, so a failed command never leaves a half-written tree. The
// Per-pid temp upper/work (minted under the snapshot dir, on the same filesystem the overlay needs) are torn down
// Unconditionally by the finalizer — they are throwaway scratch, never a published snapshot layer.
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
