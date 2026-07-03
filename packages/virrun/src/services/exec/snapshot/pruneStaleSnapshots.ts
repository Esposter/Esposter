import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current lockfile hash's dir is ever reused, so evict every superseded `snapshots/<hash>` to keep the
// Host-global cache pinned to the single live entry. The removals are pure cache hygiene the current run never
// Depends on, so they run detached (via sweepStaleEntries → removeSnapshotDirectoryDetached) off the command's
// Critical path, best-effort per dir.
export const pruneStaleSnapshots = (currentHash: string): void => {
  sweepStaleEntries(join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME), (name) => name !== currentHash);
};
