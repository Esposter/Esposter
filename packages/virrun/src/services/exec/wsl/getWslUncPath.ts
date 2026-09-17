import { WSL_UNC_REGEX } from "#src/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
// A path on the distro's own filesystem as a Windows UNC (`/home/x` → `\wsl.localhost\<distro>\home\x`) — the inverse
// Of readWslPath, and the only spawn-free way for the win32 host to read distro state: plain `node:fs` over the 9p
// Bridge, no `wsl.exe` launch. That matters where the caller exists to SKIP a WSL spawn (readWslLoginEnvironmentCache
// Validating a persisted probe), since resolving the answer by spawning would cost exactly what the cache saves.
//
// The distro segment is taken off getWslNativeCacheRoot rather than probed again: that root is already
// `\wsl.localhost\<distro>\<home>\.virrun` for this host, cached Windows-side, and re-resolving the distro name here
// Would be a second probe of the same fact that could disagree with the root every other UNC in the process is built
// From. Its Linux tail is what the regex captures, so the prefix is the root minus that tail.
export const getWslUncPath = (linuxPath: string): string => {
  const cacheRoot = getWslNativeCacheRoot();
  const cacheRootTail = WSL_UNC_REGEX.exec(cacheRoot)?.groups?.linuxPath ?? "";
  const distroRoot = cacheRootTail ? cacheRoot.slice(0, -cacheRootTail.length) : cacheRoot;
  return `${distroRoot}${linuxPath.replaceAll("/", "\\")}`;
};
