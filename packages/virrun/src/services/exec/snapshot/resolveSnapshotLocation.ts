import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolves where a repo's warm snapshot lives without materializing anything: keyed by the lockfile hash
// Under the host-global `~/.virrun/snapshots/<hash>`. It lives outside the repo (not under `<cwd>/.virrun`
// Like the dep store) because the fork run stacks this dir as an overlay lower beside the source, and
// Overlayfs rejects a lower that nests inside another. `exists` reflects whether the upper layer has been
// Captured (atomically renamed into place by the capture run), so the orchestrator can fork it or fall
// Through to a capture run. Pure addressing — the capture run owns creating its temp upper/work lazily.
export const resolveSnapshotLocation = (cwd: string): SnapshotLocation => {
  const hash = computeLockfileHash(cwd);
  const snapshotDir = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);
  const upperDir = join(snapshotDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
  return {
    dir: snapshotDir,
    exists: existsSync(upperDir),
    hash,
    upperDir,
  };
};
