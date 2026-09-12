import { writeRemoved } from "#src/services/cli/cache/writeRemoved";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { CACHE_CLEAN_TIMEOUT_MS } from "#src/services/exec/util/constants";
// Every cache root is torn down identically — unbounded (CACHE_CLEAN_TIMEOUT_MS), because a clean is explicit and must
// Run to completion rather than be SIGTERM'd into a half-swept cache — so the roots below read as a list of what is
// Removed rather than as a repeated remove-then-report pair.
export const removeCacheDirectory = (path: string): void => {
  removeSnapshotDirectory(path, CACHE_CLEAN_TIMEOUT_MS);
  writeRemoved(path);
};
