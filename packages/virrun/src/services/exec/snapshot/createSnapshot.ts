import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, rmSync } from "node:fs";
// Captures warm post-install state: runs `command` (e.g. `pnpm install`) through the os backend in capture
// Mode, so its writes persist into the snapshot's overlay upper in the global cache instead of vanishing in
// Tmpfs. The frozen upper, keyed by lockfile hash, is the layer every later fork stacks read-only over the
// Source — install runs once, then re-runs skip it entirely (specs/snapshot-fork.md). Callers check
// `location.exists` first to reuse an existing snapshot; here we always (re)capture. The location resolved
// Before the run is reused on success (rather than re-resolved) so the lockfile hash that keyed the cache
// Entry stays the key even if the install rewrote the lockfile — otherwise the captured upper would orphan
// Under the old hash while we report the new one. On failure (non-zero exit or a throw) the partial/empty
// Upper is removed so it is never read back as a usable snapshot.
export const createSnapshot = async (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotLocation> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { dir, upperDir, workDir } = location;
  mkdirSync(upperDir, { recursive: true });
  mkdirSync(workDir, { recursive: true });
  return getResultAsync(async () => {
    const { exitCode, stderr } = await backend.exec(command, { ...options, overlayLayers: { upperDir, workDir } });
    if (exitCode !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        createSnapshot.name,
        `snapshot setup command exited with ${exitCode}: ${stderr}`,
      );
    // Reuse the pre-resolved address; the upper now exists, so report it as a usable snapshot.
    return { ...location, exists: true };
  }).match(
    (value) => value,
    (error) => {
      rmSync(dir, { force: true, recursive: true });
      throw error;
    },
  );
};
