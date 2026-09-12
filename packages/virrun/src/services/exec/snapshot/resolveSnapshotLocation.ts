import type { SnapshotLocation } from "#src/models/exec/snapshot/SnapshotLocation";

import { computeEnvironmentKey } from "#src/services/exec/snapshot/computeEnvironmentKey";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "#src/services/exec/snapshot/constants";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolves a repo's warm-snapshot address (environment-keyed: lockfile digest + sandbox node major, host-global)
// Without materializing anything. It lives outside the repo because the fork run stacks this directory as an overlay lower
// Beside the source, and overlayfs rejects a lower that nests inside another. `exists` reflects whether the upper has
// Been captured.
export const resolveSnapshotLocation = (cwd: string): SnapshotLocation => {
  const hash = computeEnvironmentKey(cwd);
  const snapshotDirectory = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);
  const upperDirectory = join(snapshotDirectory, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
  return {
    directory: snapshotDirectory,
    exists: existsSync(upperDirectory),
    hash,
    upperDirectory,
  };
};
