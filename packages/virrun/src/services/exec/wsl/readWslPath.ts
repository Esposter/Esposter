import { execFileSync } from "node:child_process";
// A `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` UNC already points at the distro's own Linux
// Filesystem, so the path inside it is just the Linux path with backslashes — `\\wsl.localhost\<distro>\home\x`
// Is `/home/x`. wslpath can't translate these (it mangles the UNC into a bogus `/mnt/c/wsl.localhost...`), so
// Map them here instead: strip the prefix + distro segment and flip the separators. This is what lets the
// Native-ext4 cache (getWslNativeCacheRoot) reach bwrap as a real `/home/...` path.
const WSL_UNC_REGEX = /^\\\\wsl(?:\.localhost|\$)\\[^\\]+(?<linuxPath>\\.*)?$/u;

const wslPaths = new Map<string, string>();

export const readWslPath = (path: string): string => {
  const wslPath = wslPaths.get(path);
  if (wslPath) return wslPath;
  const uncMatch = WSL_UNC_REGEX.exec(path);
  const newWslPath =
    uncMatch === null
      ? execFileSync("wsl.exe", ["--exec", "wslpath", "-a", path], { encoding: "utf8", stdio: "pipe" }).trim()
      : (uncMatch.groups?.linuxPath ?? "").replaceAll("\\", "/") || "/";
  wslPaths.set(path, newWslPath);
  return newWslPath;
};
