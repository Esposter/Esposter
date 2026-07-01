import { VIRRUN_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { join } from "node:path";
// The consuming repo's gitignored cache root, `<workspace-root>/.virrun`. Holds the shared dep store, safe inside
// The repo because it is bind-mounted (binds may overlap the overlay). Warm snapshots cannot live here — their
// Overlay layer would nest inside the source lower, which overlayfs rejects — so they use getGlobalCacheDirectory.
export const getRepoCacheDirectory = (cwd: string): string =>
  join(resolveWorkspaceRoot(cwd), VIRRUN_CACHE_DIRECTORY_NAME);
