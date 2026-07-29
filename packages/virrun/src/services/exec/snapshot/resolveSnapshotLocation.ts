import type { SnapshotLocation } from "@/models/exec/snapshot/SnapshotLocation";

import { computeEnvironmentKey } from "@/services/exec/snapshot/computeEnvironmentKey";
import { VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolves a repo's warm-snapshot address (environment-keyed: lockfile digest + sandbox node major, host-global) without materializing anything. It
// Lives outside the repo because the fork run stacks this dir as an overlay lower beside the source, and overlayfs
// Rejects a lower that nests inside another. `exists` reflects whether the upper has been captured.
export const resolveSnapshotLocation = (cwd: string): SnapshotLocation => {
  const hash = computeEnvironmentKey(cwd);
  const snapshotDir = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);
  const upperDir = join(snapshotDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
  return {
    dir: snapshotDir,
    exists: existsSync(upperDir),
    hash,
    upperDir,
  };
};
