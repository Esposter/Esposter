import type { PrepareLocation } from "@/models/exec/snapshot/PrepareLocation";
import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { PrepareStep } from "@/models/virrun/PrepareStep";

import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { pruneToOutputs } from "@/services/exec/snapshot/pruneToOutputs";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { getResult, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, renameSync } from "node:fs";
import { join } from "node:path";
// Captures a framework's generated artifacts into the source-keyed prepare layer. Forks the deps snapshot as a
// Read-only lower (so `nuxt prepare` sees the sandbox's own Linux dep closure) with a persistent capture upper, runs
// The prepare command, keeps only the declared `outputs` (pruneToOutputs — the inverse of pruneSnapshotUpper), then
// Atomically publishes via a per-pid temp + rename, the same barrier createSnapshot uses: a concurrent reader never
// Sees a half-built upper, and a capturer that loses the rename race keeps the published one. On any failure only
// This invocation's temps are torn down. Requires the deps snapshot to exist (the caller provisions it first). The
// Publish target is the caller's already-resolved `location`, not a re-resolve: the layer is published to the exact
// Path the caller will mount, so a source-hash shift between resolves can never leave the mounted upper unbuilt.
export const createPrepareLayer = (
  backend: ExecBackend,
  prepareStep: PrepareStep,
  options: ExecOptions,
  { dir, upperDir }: PrepareLocation,
): Promise<void> => {
  const depsLocation = resolveSnapshotLocation(options.cwd);
  if (!depsLocation.exists)
    throw new InvalidOperationError(
      Operation.Create,
      createPrepareLayer.name,
      "no captured deps snapshot to fork for the prepare layer; run createSnapshot first",
    );
  // "" until created so the failure finalizer knows whether there is anything to tear down.
  let captureUpperDir = "";
  let captureWorkDir = "";
  return getResultAsync(async () => {
    mkdirSync(dir, { recursive: true });
    captureUpperDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`));
    captureWorkDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`));
    const result = await backend.exec(prepareStep.command, {
      ...options,
      overlayLayers: { lowerDirs: [depsLocation.upperDir], upperDir: captureUpperDir, workDir: captureWorkDir },
    });
    if (result.exitCode !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        createPrepareLayer.name,
        `prepare command exited with ${result.exitCode}: ${result.stderr}`,
      );
    // This layer owns only the declared outputs; the deps snapshot below supplies the dep tree the prepare churned.
    pruneToOutputs(captureUpperDir, prepareStep.outputs);
    getResult(() => {
      renameSync(captureUpperDir, upperDir);
    }).match(
      () => undefined,
      (error) => {
        if (!existsSync(upperDir)) throw error;
        removeSnapshotDirectory(captureUpperDir);
      },
    );
    removeSnapshotDirectory(captureWorkDir);
  }).match(
    () => undefined,
    (error) => {
      if (captureUpperDir) removeSnapshotDirectory(captureUpperDir);
      if (captureWorkDir) removeSnapshotDirectory(captureWorkDir);
      throw error;
    },
  );
};
