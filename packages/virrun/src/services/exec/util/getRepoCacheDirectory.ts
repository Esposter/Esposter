import { VIRRUN_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { join } from "node:path";
// The consuming repo's gitignored cache root, `<workspace-root>/.virrun`. Holds the shared dep store, which is
// Safe to keep inside the repo because it is bind-mounted (binds may overlap the overlay). Anchored at the
// Workspace root (not the raw cwd) so invoking virrun from a subdirectory reuses the one repo cache instead of
// Scattering a `.virrun` into every cwd. Warm snapshots cannot live here — their overlay layer would nest
// Inside the source lower and overlayfs rejects overlapping lower dirs at fork time — so they go in the
// Host-global cache instead (getGlobalCacheDirectory).
export const getRepoCacheDirectory = (cwd: string): string =>
  join(resolveWorkspaceRoot(cwd), VIRRUN_CACHE_DIRECTORY_NAME);
