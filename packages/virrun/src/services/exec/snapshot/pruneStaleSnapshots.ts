import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { hasLiveLease } from "@/services/exec/snapshot/hasLiveLease";
import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current lockfile hash's dir is reused by THIS run, so evict every superseded `snapshots/<hash>` to keep the
// Host-global cache small — but that cache is shared across repos/worktrees, so spare a superseded dir a concurrent run
// On a different hash still leases (hasLiveLease, which also reaps that dir's dead-pid leases in passing). The removals
// Are pure cache hygiene the current run never depends on, so they run detached (via sweepStaleEntries →
// RemoveSnapshotDirectoryDetached) off the command's critical path, best-effort per dir.
export const pruneStaleSnapshots = (currentHash: string): void => {
  const snapshotsDir = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
  sweepStaleEntries(snapshotsDir, (name) => name !== currentHash && !hasLiveLease(join(snapshotsDir, name)));
};
