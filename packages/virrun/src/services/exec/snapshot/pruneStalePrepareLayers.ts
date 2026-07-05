import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { pruneSupersededEntries } from "@/services/exec/snapshot/pruneSupersededEntries";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current source-state's prepare layer is reused by THIS run, so evict every superseded `prepare/<key>` —
// Sparing leased ones, detached, best-effort (pruneSupersededEntries). Because the key moves on every source edit,
// Active dev strands a superseded layer on nearly every run, so the detached removal (rather than a blocking rm -rf
// Of the previous .nuxt closure) matters most here.
export const pruneStalePrepareLayers = (currentKey: string): void => {
  pruneSupersededEntries(join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME), currentKey);
};
