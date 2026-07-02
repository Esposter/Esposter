import {
  PROBE_TIMEOUT_MS,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_FORCE_PROBE_KEY,
  WSL_CACHE_ROOT_CACHE_FILENAME,
} from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// The default WSL distro's ext4 home as a Windows UNC (`\\wsl.localhost\<distro>\home\<user>\.virrun`). virrun's
// Write-heavy cache (snapshot overlay dirs, pnpm store, corepack home) lives here rather than under the repo or `~`
// On the Windows drive, because those resolve to `/mnt/c` (v9fs) inside WSL — 15-64x slower for the many-small-file
// Install, and it silently never finishes capturing the snapshot. readWslPath later maps the UNC back to `/home/...`
// So the bulk writes happen Linux-side at native ext4 speed.
// Three-tier like readWslLoginPath / isOsBackendSupported so a fresh `virrun -- <cmd>` process skips the two
// `wsl.exe` round-trips below on a warm host: in-process memo → persisted Windows-side cache (getHostFingerprint-keyed,
// VIRRUN_FORCE_PROBE bypass) → probe. Caching this Windows-side also makes the win32 capability.json read cheap, since
// GetGlobalCacheDirectory calls this to locate ~/.virrun. Only a successful resolve is persisted (the throw path
// Below never reaches the write), so a transient WSL failure re-probes next process.
let wslNativeCacheRoot = "";

export const getWslNativeCacheRoot = (): string => {
  if (wslNativeCacheRoot) return wslNativeCacheRoot;
  const key = getHostFingerprint();
  if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
    const cached = readWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, key);
    if (cached !== undefined) {
      wslNativeCacheRoot = cached;
      return cached;
    }
  }
  // `wsl.exe -l -q` lists installed distros (default first) as UTF-16LE; the first non-empty line is the distro
  // `wsl.exe --exec` runs commands in, so its `$HOME` is the matching home directory.
  const distro = getResult(() =>
    execFileSync("wsl.exe", ["-l", "-q"], { encoding: "utf16le", stdio: "pipe", timeout: PROBE_TIMEOUT_MS }),
  )
    .map(
      (output) =>
        output
          .split(/\r?\n/u)
          .map((line) => line.trim())
          .find(Boolean) ?? "",
    )
    .unwrapOr("");
  const home = getResult(() =>
    execFileSync("wsl.exe", ["--exec", "sh", "-c", "echo $HOME"], {
      encoding: "utf8",
      stdio: "pipe",
      timeout: PROBE_TIMEOUT_MS,
    }),
  )
    .map((output) => output.trim())
    .unwrapOr("");
  if (distro === "" || home === "")
    throw new InvalidOperationError(
      Operation.Read,
      getWslNativeCacheRoot.name,
      "could not resolve the WSL distro or home directory",
    );
  wslNativeCacheRoot = `\\\\wsl.localhost\\${distro}\\${home.replace(/^\//u, "").replaceAll("/", "\\")}\\${VIRRUN_CACHE_DIRECTORY_NAME}`;
  writeWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, { key, value: wslNativeCacheRoot });
  return wslNativeCacheRoot;
};
