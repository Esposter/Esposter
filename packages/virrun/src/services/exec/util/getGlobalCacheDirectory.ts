import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { homedir } from "node:os";
import { join } from "node:path";
// The host-global cache root. Warm snapshots live here rather than inside the repo for two reasons: a snapshot's
// Overlay layer may not nest inside the source tree it is forked over (overlayfs forbids overlapping lower dirs),
// And a host-global, lockfile-hash-keyed location lets the same warm snapshot be reused across repos and CI runs
// (specs/snapshot-fork.md).
//
// On win32 the os backend runs through WSL, where the Windows `~` resolves to `/mnt/c` (v9fs) — 15-64x slower for
// The many-small-file snapshot capture, which then silently never finishes. Anchor the cache on the WSL distro's
// Own ext4 home (via a `\\wsl.localhost` UNC) so the overlay upper/work writes land at native speed. Elsewhere
// (Linux, or no WSL) it is `~/.virrun`. VIRRUN_CACHE_HOME overrides all of this (tests, custom layouts).
export const getGlobalCacheDirectory = (): string =>
  process.env[VIRRUN_CACHE_HOME_KEY] ||
  (process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME));
