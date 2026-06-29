import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { SnapshotCapture } from "@/models/exec/SnapshotCapture";

import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { getResult, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, renameSync } from "node:fs";
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
// Atomic publish: the install writes into a private temp upper, then a single `renameSync` promotes it onto
// The final `upperDir`. `existsSync(upperDir)` — the readiness signal every fork/resolve reads — is the last
// Thing to flip, so a concurrent reader never sees a half-built upper mid-install (the rename is the publish
// Barrier). Each capture mints its own temp upper/work via `mkdtempSync`, so even two captures in the same
// Process never share an overlay dir; a capturer that loses the publish race renames onto an already-populated
// `upperDir`, which fails — it then keeps the published equivalent layer and drops its own temp instead of
// Erroring. On failure only this invocation's temps are torn down, never a sibling's published or in-flight work.
// The capture run's result is returned alongside the location: it is a real execution, so the cold-path fork
// Returns it directly rather than re-running the command over the frozen upper.
export const createSnapshot = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotCapture> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { dir, upperDir } = location;
  // Lazily minted inside the run via mkdtempSync so each invocation gets a unique temp; "" until created so the
  // Failure finalizer can tell whether there is anything to tear down (mkdtemp itself could be what threw).
  let captureUpperDir = "";
  let captureWorkDir = "";
  return getResultAsync(async () => {
    mkdirSync(dir, { recursive: true });
    captureUpperDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`));
    captureWorkDir = mkdtempSync(join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`));
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
    // Promote the temp upper onto its final address — the publish barrier. The rename is the only check: if a
    // Concurrent capturer already published an equivalent layer, renaming onto the now-populated `upperDir`
    // Fails, so we keep theirs and discard ours; otherwise ours lands atomically. Renaming-then-checking
    // Collapses the check-then-rename window where two capturers both saw `exists === false` and both renamed.
    // Probe the already-resolved `upperDir` directly rather than re-resolving the location: the install may have
    // Rewritten the lockfile, which would re-hash to a different snapshot key and check the wrong address.
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
    // Reuse the pre-resolved address; the upper now exists, so report it as a usable snapshot.
    return { location: { ...location, exists: true }, result };
  }).match(
    (value) => value,
    (error) => {
      // Tear down only this invocation's temps — a sibling capturer's published or in-flight layer must survive.
      if (captureUpperDir) removeSnapshotDirectory(captureUpperDir);
      if (captureWorkDir) removeSnapshotDirectory(captureWorkDir);
      throw error;
    },
  );
};
