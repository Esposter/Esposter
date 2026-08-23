import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { SnapshotCapture } from "#src/models/exec/snapshot/SnapshotCapture";

import { captureOverlayUpper } from "#src/services/exec/snapshot/captureOverlayUpper";
import { pruneSnapshotUpper } from "#src/services/exec/snapshot/pruneSnapshotUpper";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
// Captures warm post-install state into the snapshot's overlay upper (keyed by lockfile hash) instead of letting
// `command`'s writes vanish in tmpfs (specs/snapshot-fork.md). The capture-and-publish barrier is
// `captureOverlayUpper`'s. The capture result is returned so the cold-path fork need not re-run.
export const createSnapshot = (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<SnapshotCapture> => {
  const location = resolveSnapshotLocation(options.cwd);
  const { dir, upperDir } = location;
  // Not `async`, so a location that cannot be resolved throws where it is called rather than on the promise
  // eslint-disable-next-line no-restricted-syntax -- the trailing `then` maps the value, and the function is deliberately not `async` (see above), so `await` cannot
  return captureOverlayUpper(backend, command, options, {
    dir,
    failureLabel: "snapshot setup command",
    operationName: createSnapshot.name,
    // The snapshot is keyed only on the lockfile, so it must freeze only what the lockfile determines: the
    // Dependency closure. Strip the source-derived artifacts the install's postinstall hooks wrote (e.g. .nuxt)
    // Before publishing, or a fork would serve a stale copy that shadows the host's fresh one once source moves
    // On — instead the fork reads them from the host source tree stacked underneath as the `--overlay-src` lower
    prune: pruneSnapshotUpper,
    upperDir,
  }).then((result) => ({ location: { ...location, exists: true }, result }));
};
