import {
  PROBE_TIMEOUT_MS,
  VIRRUN_CACHE_DIRECTORY_NAME,
  WSL_CACHE_ROOT_CACHE_FILENAME,
} from "@/services/exec/util/constants";
import { createProbeCache } from "@/services/exec/util/createProbeCache";
import { execWsl } from "@/services/exec/wsl/execWsl";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";
// The default WSL distro's ext4 home as a Windows UNC (`\\wsl.localhost\<distro>\home\<user>\.virrun`). virrun's
// Write-heavy cache (snapshot overlay dirs, pnpm store, corepack home) lives here rather than under the repo or `~`
// On the Windows drive, because those resolve to `/mnt/c` (v9fs) inside WSL — 15-64x slower for the many-small-file
// Install, and it silently never finishes capturing the snapshot. readWslPath later maps the UNC back to `/home/...`
// So the bulk writes happen Linux-side at native ext4 speed.
// Caching this Windows-side also makes the win32 capability.json read cheap, since getGlobalCacheDirectory calls this
// To locate ~/.virrun. A failed resolve throws (the write is never reached), so a transient WSL failure re-probes
// Next call and next process.
export const getWslNativeCacheRoot: () => string = createProbeCache({
  probe: () => {
    // `wsl.exe -l -q` lists installed distros (default first) as UTF-16LE; the first non-empty line is the distro
    // `wsl.exe --exec` runs commands in, so its `$HOME` is the matching home directory.
    const distro = getResult(() => execWsl(["-l", "-q"], { encoding: "utf16le", timeout: PROBE_TIMEOUT_MS }))
      .map(
        (output) =>
          output
            .split(/\r?\n/u)
            .map((line) => line.trim())
            .find(Boolean) ?? "",
      )
      .unwrapOr("");
    const home = getResult(() => execWsl(["--exec", "sh", "-c", "echo $HOME"], { timeout: PROBE_TIMEOUT_MS }))
      .map((output) => output.trim())
      .unwrapOr("");
    if (!distro || !home)
      throw new InvalidOperationError(
        Operation.Read,
        getWslNativeCacheRoot.name,
        "could not resolve the WSL distro or home directory",
      );
    return `\\\\wsl.localhost\\${distro}\\${home.replace(/^\//u, "").replaceAll("/", "\\")}\\${VIRRUN_CACHE_DIRECTORY_NAME}`;
  },
  readPersistedCache: (key) => readWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, z.string(), key),
  shouldPersist: () => true,
  writePersistedCache: (cache) => {
    writeWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, cache);
  },
});
