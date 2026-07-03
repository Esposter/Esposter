import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { hasLiveLease } from "@/services/exec/snapshot/hasLiveLease";
import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";
// Only the current source-state's prepare layer is reused by THIS run, so evict every superseded `prepare/<key>` to
// Keep the host-global cache small (each source edit mints a new key) — but spare a superseded layer a concurrent run
// Still leases (hasLiveLease, which also reaps that dir's dead-pid leases in passing). Because the key moves on every
// Edit, active dev strands a superseded layer on nearly every run — so the removals run detached (via sweepStaleEntries
// → removeSnapshotDirectoryDetached) off the command's critical path rather than blocking on an rm -rf of the previous
// .nuxt closure. Best-effort per dir.
export const pruneStalePrepareLayers = (currentKey: string): void => {
  const prepareDir = join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME);
  sweepStaleEntries(prepareDir, (name) => name !== currentKey && !hasLiveLease(join(prepareDir, name)));
};
