import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { pruneSupersededEntries } from "#src/services/exec/snapshot/pruneSupersededEntries";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current lockfile hash's dir is reused by THIS run, so evict every superseded `snapshots/<hash>` — sparing
// Leased ones, detached, best-effort (pruneSupersededEntries).
export const pruneStaleSnapshots = (currentHash: string): void => {
  pruneSupersededEntries(join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME), currentHash);
};
