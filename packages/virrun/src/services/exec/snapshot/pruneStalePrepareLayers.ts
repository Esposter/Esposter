import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current source-state's prepare layer is ever reused, so evict every superseded `prepare/<key>` to keep the
// Host-global cache pinned to the single live entry (each source edit mints a new key). Because the key moves on every
// Edit, active dev strands a superseded layer on nearly every run — so the removals run detached (via sweepStaleEntries
// → removeSnapshotDirectoryDetached) off the command's critical path rather than blocking on an rm -rf of the previous
// .nuxt closure. Best-effort per dir.
export const pruneStalePrepareLayers = (currentKey: string): void => {
  sweepStaleEntries(join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME), (name) => name !== currentKey);
};
