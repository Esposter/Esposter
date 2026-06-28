import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";
// Captures warm post-install state: runs `command` (e.g. `pnpm install`) through the os backend in capture
// Mode, so its writes persist into the snapshot's overlay upper in the global cache instead of vanishing in
// Tmpfs. The frozen upper, keyed by lockfile hash, is the layer every later fork stacks read-only over the
// Source — install runs once, then re-runs skip it entirely (specs/snapshot-fork.md). Callers check
// `location.exists` first to reuse an existing snapshot; here we always (re)capture. A non-zero exit throws
// So a half-installed upper is never handed back as a usable snapshot.
export const createSnapshot = async (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotLocation> => {
  const { upperDir, workDir } = resolveSnapshotLocation(options.cwd);
  mkdirSync(upperDir, { recursive: true });
  mkdirSync(workDir, { recursive: true });
  const { exitCode, stderr } = await backend.exec(command, { ...options, overlayLayers: { upperDir, workDir } });
  if (exitCode !== 0)
    throw new InvalidOperationError(
      Operation.Create,
      createSnapshot.name,
      `snapshot setup command exited with ${exitCode}: ${stderr}`,
    );
  // Re-resolve so the returned location reports the post-capture truth (exists === true), not the pre-capture
  // Snapshot taken before the upper layer was materialized.
  return resolveSnapshotLocation(options.cwd);
};
