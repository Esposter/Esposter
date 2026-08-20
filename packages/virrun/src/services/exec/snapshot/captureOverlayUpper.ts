import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { CaptureOverlayUpperOptions } from "@/models/exec/snapshot/CaptureOverlayUpperOptions";

import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { getProvisionFailureMessage } from "@/services/exec/snapshot/getProvisionFailureMessage";
import { removeSnapshotDirectoryBestEffort } from "@/services/exec/snapshot/removeSnapshotDirectoryBestEffort";
import { withPidTempPrefix } from "@/services/exec/util/withPidTempPrefix";
import { getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, renameSync } from "node:fs";
import { join } from "node:path";

// The publish protocol both captured layers share — the deps snapshot and the prepare layer differ only in what
// They stack under, what they keep, and what they return. Everything else is the same barrier, and it is the
// Part that must not drift: the command writes into a private per-invocation temp upper, and a single
// `renameSync` promotes it onto the final `upperDir` as the last thing to flip, so a concurrent reader (every
// Fork and resolve reads `existsSync(upperDir)`) never sees a half-built upper. Rename-then-check rather than
// Check-then-rename collapses the window where two capturers both saw `exists === false`; the loser keeps the
// Published layer and discards its own. The pre-resolved `upperDir` is probed rather than a re-resolve, because
// The command may have rewritten the lockfile and re-hashed to a different key. On any failure only this
// Invocation's temps are torn down — a sibling capturer's published or in-flight layer must survive
export const captureOverlayUpper = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
  { dir, failureLabel, lowerDirs, operationName, prune, upperDir }: CaptureOverlayUpperOptions,
): Promise<ExecResult> => {
  // "" until created so the failure finalizer knows whether there is anything to tear down (mkdtemp itself could throw).
  let captureUpperDir = "";
  let captureWorkDir = "";
  return getResultAsync(async () => {
    mkdirSync(dir, { recursive: true });
    captureUpperDir = mkdtempSync(join(dir, withPidTempPrefix(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`)));
    captureWorkDir = mkdtempSync(join(dir, withPidTempPrefix(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`)));
    const result = await backend.exec(command, {
      ...options,
      // Spread conditionally rather than passing `undefined`: an ephemeral capture stacks no extra lower, and
      // The argv builder reads the field's presence
      overlayLayers: { ...(lowerDirs ? { lowerDirs } : {}), upperDir: captureUpperDir, workDir: captureWorkDir },
    });
    if (result.exitCode !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        operationName,
        getProvisionFailureMessage(failureLabel, result, options),
      );
    // Prune the private temp upper, never the published one.
    prune(captureUpperDir);
    getResult(() => {
      renameSync(captureUpperDir, upperDir);
    }).match(
      noop,
      (error) => {
        if (!existsSync(upperDir)) throw error;
        removeSnapshotDirectoryBestEffort(captureUpperDir);
      },
    );
    removeSnapshotDirectoryBestEffort(captureWorkDir);
    return result;
  }).match(
    (value) => value,
    (error) => {
      if (captureUpperDir) removeSnapshotDirectoryBestEffort(captureUpperDir);
      if (captureWorkDir) removeSnapshotDirectoryBestEffort(captureWorkDir);
      throw error;
    },
  );
};
