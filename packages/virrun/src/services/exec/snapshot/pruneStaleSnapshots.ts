import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectoryDetached } from "@/services/exec/snapshot/removeSnapshotDirectoryDetached";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getResult } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Only the current lockfile hash's dir is ever reused, so evict every superseded `snapshots/<hash>` to keep the
// Host-global cache pinned to the single live entry. The removals are pure cache hygiene the current run never
// Depends on, so they run detached (removeSnapshotDirectoryDetached) off the command's critical path. Best-effort
// Per dir: a failed removal must not abort the run.
export const pruneStaleSnapshots = (currentHash: string): void => {
  const snapshotsDir = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
  if (!existsSync(snapshotsDir)) return;
  for (const entry of readdirSync(snapshotsDir, { withFileTypes: true }))
    if (entry.isDirectory() && entry.name !== currentHash)
      getResult(() => {
        removeSnapshotDirectoryDetached(join(snapshotsDir, entry.name));
      }).match(
        () => undefined,
        () => undefined,
      );
};
