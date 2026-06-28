import { VIRRUN_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { join } from "node:path";
// The consuming repo's gitignored cache root, `<cwd>/.virrun`. Holds the shared dep store, which is safe to
// Keep inside the repo because it is bind-mounted (binds may overlap the overlay). Warm snapshots cannot
// Live here — their overlay layer would nest inside the source lower and overlayfs rejects overlapping
// Lower dirs at fork time — so they go in the host-global cache instead (getGlobalCacheDirectory).
export const getRepoCacheDirectory = (cwd: string): string => join(resolveCwd(cwd), VIRRUN_CACHE_DIRECTORY_NAME);
