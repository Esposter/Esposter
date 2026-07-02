import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectoryDetached } from "@/services/exec/snapshot/removeSnapshotDirectoryDetached";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getResult } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Only the current source-state's prepare layer is ever reused, so evict every superseded `prepare/<key>` to keep the
// Host-global cache pinned to the single live entry (each source edit mints a new key). Because the key moves on every
// Edit, active dev strands a superseded layer on nearly every run — so the removals run detached
// (removeSnapshotDirectoryDetached) off the command's critical path rather than blocking on an rm -rf of the previous
// .nuxt closure. Best-effort per dir: a failed removal must not abort the run.
export const pruneStalePrepareLayers = (currentKey: string): void => {
  const prepareDir = join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME);
  if (!existsSync(prepareDir)) return;
  for (const entry of readdirSync(prepareDir, { withFileTypes: true }))
    if (entry.isDirectory() && entry.name !== currentKey)
      getResult(() => {
        removeSnapshotDirectoryDetached(join(prepareDir, entry.name));
      }).match(
        () => undefined,
        () => undefined,
      );
};
