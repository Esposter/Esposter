import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Runs a command over a captured warm snapshot: stacks the frozen overlay upper as a read-only lower beside
// The source with a fresh tmpfs upper, so the run reuses the post-install dep tree without reinstalling and
// Its own writes vanish. The fork half of the pair — call createSnapshot once, then forkSnapshot per run.
// Throws if no snapshot has been captured for this lockfile yet, so a fork never silently runs without the
// Deps it assumes are present (fork owns the overlay layering; any overlayLayers on options is replaced).
export const forkSnapshot = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<ExecResult> => {
  const { exists, upperDir } = resolveSnapshotLocation(options.cwd);
  if (!exists)
    throw new InvalidOperationError(
      Operation.Read,
      forkSnapshot.name,
      "no captured snapshot to fork; run createSnapshot first",
    );
  return backend.exec(command, { ...options, overlayLayers: { lowerDirs: [upperDir] } });
};
