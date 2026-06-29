import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
// Where the os backend's write-heavy caches (pnpm store, corepack home) live. On win32 the sandbox runs through
// WSL, where the repo path resolves to /mnt/c (v9fs) — 15-64x slower for the many-small-file install — so route
// Them to the WSL distro's own ext4 home instead. On Linux they stay inside the repo's `.virrun`.
export const getOsCacheRoot = (cwd: string): string =>
  process.platform === "win32" ? getWslNativeCacheRoot() : getRepoCacheDirectory(cwd);
