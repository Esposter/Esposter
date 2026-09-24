import { VIRRUN_CACHE_HOME_KEY } from "#src/services/exec/util/constants";
import { getDefaultGlobalCacheDirectory } from "#src/services/exec/util/getDefaultGlobalCacheDirectory";
// The host-global cache root for warm snapshots. Outside the repo because a snapshot's overlay layer may not nest
// Inside the source tree it is forked over (overlayfs forbids overlapping lower directories), and a host-global,
// Lockfile-hash-keyed location lets one warm snapshot be reused across repos and CI runs.
export const getGlobalCacheDirectory = (): string =>
  process.env[VIRRUN_CACHE_HOME_KEY] || getDefaultGlobalCacheDirectory();
