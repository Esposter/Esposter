import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getResult } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Only the current source-state's prepare layer is ever reused, so evict every superseded `prepare/<key>` to keep the
// Host-global cache pinned to the single live entry (each source edit mints a new key). Best-effort per dir: a failed
// Removal must not abort the run.
export const pruneStalePrepareLayers = (currentKey: string): void => {
  const prepareDir = join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME);
  if (!existsSync(prepareDir)) return;
  for (const entry of readdirSync(prepareDir, { withFileTypes: true }))
    if (entry.isDirectory() && entry.name !== currentKey)
      getResult(() => {
        removeSnapshotDirectory(join(prepareDir, entry.name));
      });
};
