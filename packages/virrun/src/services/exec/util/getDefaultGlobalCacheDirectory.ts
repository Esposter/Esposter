import { VIRRUN_CACHE_DIRECTORY_NAME } from "#src/services/exec/util/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
import { homedir } from "node:os";
import { join } from "node:path";

// The host-global cache root before any VIRRUN_CACHE_HOME override. On win32 the Windows `~` resolves to `/mnt/c`
// (v9fs) inside WSL — 15-64x slower for the many-small-file capture, which then silently never finishes — so it
// Anchors on the WSL distro's own ext4 home via a `\\wsl.localhost` UNC.
export const getDefaultGlobalCacheDirectory = (): string =>
  process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME);
