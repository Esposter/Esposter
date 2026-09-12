import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { SnapshotCapture } from "#src/models/exec/snapshot/SnapshotCapture";

import { captureOverlayUpper } from "#src/services/exec/snapshot/captureOverlayUpper";
import { pruneSnapshotUpper } from "#src/services/exec/snapshot/pruneSnapshotUpper";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
// Captures warm post-install state into the snapshot's overlay upper (keyed by lockfile hash) instead of letting
// `command`'s writes vanish in tmpfs (apps/web/content/docs/virrun/snapshot-and-fork.md). The capture-and-publish
// Barrier is `captureOverlayUpper`'s. The capture result is returned so the cold-path fork need not re-run.
export const createSnapshot = async (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotCapture> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { directory, upperDirectory } = location;
  const result = await captureOverlayUpper(backend, command, options, {
    directory,
    failureLabel: "snapshot setup command",
    operationName: createSnapshot.name,
    // The snapshot is keyed only on the lockfile, so it must freeze only what the lockfile determines: the
    // Dependency closure. Strip the source-derived artifacts the install's postinstall hooks wrote (e.g. .nuxt)
    // Before publishing, or a fork would serve a stale copy that shadows the host's fresh one once source moves
    // On — instead the fork reads them from the host source tree stacked underneath as the `--overlay-src` lower
    prune: pruneSnapshotUpper,
    upperDirectory,
  });
  return { location: { ...location, exists: true }, result };
};
