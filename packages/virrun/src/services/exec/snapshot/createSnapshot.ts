import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { SnapshotCapture } from "@/models/exec/SnapshotCapture";

import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { getResult, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, renameSync } from "node:fs";
import { join } from "node:path";
// Captures warm post-install state into the snapshot's overlay upper (keyed by lockfile hash) instead of letting
// `command`'s writes vanish in tmpfs (specs/snapshot-fork.md). Atomic publish: the install writes into a private
// per-invocation temp upper, then a single `renameSync` promotes it onto the final `upperDir` — the last thing to
// Flip, so a concurrent reader (every fork/resolve reads `existsSync(upperDir)`) never sees a half-built upper, and
// A capturer that loses the race renames onto a populated `upperDir`, fails, and keeps theirs. On any failure only
// This invocation's temps are torn down. The capture result is returned so the cold-path fork need not re-run.
export const createSnapshot = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotCapture> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { dir, upperDir } = location;
  // "" until created so the failure finalizer knows whether there is anything to tear down (mkdtemp itself could throw).
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
    // Rename-then-check (not check-then-rename) collapses the window where two capturers both saw `exists === false`.
    // Probe the pre-resolved `upperDir`, not a re-resolve: the install may have rewritten the lockfile, re-hashing to
    // A different key and checking the wrong address.
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
