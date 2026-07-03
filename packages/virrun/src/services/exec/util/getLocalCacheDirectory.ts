import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { homedir } from "node:os";
import { join } from "node:path";
// The same-OS, spawn-free cache root: `~/.virrun` on the host virrun's process actually runs on (VIRRUN_CACHE_HOME
// Override). Unlike getGlobalCacheDirectory, on win32 this stays the WINDOWS `~` rather than routing to the WSL
// Distro's ext4 home — because locating that ext4 home *is* getWslNativeCacheRoot, so a cache that persists WSL probe
// Results (readWslEnvironmentCache) must live here to avoid a circular "resolve the cache dir by spawning the very
// Probe the cache exists to skip". On non-win32 it coincides with getGlobalCacheDirectory; only the win32 WSL
// Environment probes read it.
export const getLocalCacheDirectory = (): string =>
  process.env[VIRRUN_CACHE_HOME_KEY] || join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME);
