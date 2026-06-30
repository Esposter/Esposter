import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { homedir } from "node:os";
import { join } from "node:path";
// The host-global cache root for warm snapshots. Outside the repo because a snapshot's overlay layer may not nest
// Inside the source tree it is forked over (overlayfs forbids overlapping lower dirs), and a host-global,
// Lockfile-hash-keyed location lets one warm snapshot be reused across repos and CI runs.
// On win32 the Windows `~` resolves to `/mnt/c` (v9fs) inside WSL — 15-64x slower for the many-small-file capture,
// Which then silently never finishes — so anchor on the WSL distro's own ext4 home via a `\\wsl.localhost` UNC.
export const getGlobalCacheDirectory = (): string =>
  process.env[VIRRUN_CACHE_HOME_KEY] ||
  (process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME));
