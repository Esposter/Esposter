import { WSL_UNC_REGEX } from "#src/services/exec/wsl/constants";
import { execWsl } from "#src/services/exec/wsl/execWsl";
// A WSL UNC (WSL_UNC_REGEX) already points at the distro's own Linux filesystem, so the path inside it is just the
// Linux path with backslashes — `\\wsl.localhost\<distro>\home\x` is `/home/x`. wslpath can't translate these (it
// Mangles the UNC into a bogus `/mnt/c/wsl.localhost...`), so map them here instead via the regex's `linuxPath` group:
// Take the captured tail and flip the separators. This is what lets the native-ext4 cache (getWslNativeCacheRoot)
// Reach bwrap as a real `/home/...` path.
const wslPathCache = new Map<string, string>();

export const readWslPath = (path: string): string => {
  const wslPath = wslPathCache.get(path);
  if (wslPath) return wslPath;
  const uncMatch = WSL_UNC_REGEX.exec(path);
  const newWslPath =
    uncMatch === null
      ? execWsl(["--exec", "wslpath", "-a", path]).trim()
      : (uncMatch.groups?.linuxPath ?? "").replaceAll("\\", "/") || "/";
  wslPathCache.set(path, newWslPath);
  return newWslPath;
};
