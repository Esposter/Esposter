import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { SnapshotCapture } from "@/models/exec/SnapshotCapture";

import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
// Captures warm post-install state: runs `command` (e.g. `pnpm install`) through the os backend in capture
// Mode, so its writes persist into the snapshot's overlay upper in the global cache instead of vanishing in
// Tmpfs. The frozen upper, keyed by lockfile hash, is the layer every later fork stacks read-only over the
// Source — install runs once, then re-runs skip it entirely (specs/snapshot-fork.md). Callers check
// `location.exists` first to reuse an existing snapshot; here we always (re)capture. The location resolved
// Before the run is reused on success (rather than re-resolved) so the lockfile hash that keyed the cache
// Entry stays the key even if the install rewrote the lockfile — otherwise the captured upper would orphan
// Under the old hash while we report the new one.
//
// Atomic publish: the install writes into a per-process temp upper, then a single `renameSync` promotes it
// Onto the final `upperDir`. `existsSync(upperDir)` — the readiness signal every fork/resolve reads — is the
// Last thing to flip, so a concurrent reader never sees a half-built upper mid-install (the rename is the
// Publish barrier). Both temp dirs are per-pid, so parallel capturers never share an overlay upper/work; a
// Capturer that loses the race finds `upperDir` already published, keeps that equivalent layer, and drops its
// Own temp. On failure only this process's temps are torn down, never a sibling's published or in-flight work.
// The capture run's result is returned alongside the location: it is a real execution, so the cold-path fork
// Returns it directly rather than re-running the command over the frozen upper.
export const createSnapshot = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotCapture> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { dir, upperDir } = location;
  const captureUpperDir = join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${process.pid}.tmp`);
  const captureWorkDir = join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.${process.pid}.tmp`);
  return getResultAsync(async () => {
    mkdirSync(captureUpperDir, { recursive: true });
    mkdirSync(captureWorkDir, { recursive: true });
    const result = await backend.exec(command, {
      ...options,
      overlayLayers: { upperDir: captureUpperDir, workDir: captureWorkDir },
    });
    if (result.exitCode !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        createSnapshot.name,
        `snapshot setup command exited with ${result.exitCode}: ${result.stderr}`,
      );
    // Promote the temp upper onto its final address — the publish barrier. If a concurrent capturer already
    // Published an equivalent layer, keep theirs and discard ours; otherwise rename ours into place atomically.
    if (resolveSnapshotLocation(options.cwd).exists) removeSnapshotDirectory(captureUpperDir);
    else renameSync(captureUpperDir, upperDir);
    removeSnapshotDirectory(captureWorkDir);
    // Reuse the pre-resolved address; the upper now exists, so report it as a usable snapshot.
    return { location: { ...location, exists: true }, result };
  }).match(
    (value) => value,
    (error) => {
      // Tear down only this process's temps — a sibling capturer's published or in-flight layer must survive.
      removeSnapshotDirectory(captureUpperDir);
      removeSnapshotDirectory(captureWorkDir);
      throw error;
    },
  );
};
