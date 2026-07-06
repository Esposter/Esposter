import type { KeyedCache } from "@/models/exec/KeyedCache";

import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { writeKeyedCache } from "@/services/exec/util/writeKeyedCache";
import { join } from "node:path";
// Persist a win32 WSL environment probe result (`filename`) so later `virrun -- <cmd>` processes skip the probe —
// Best-effort and atomic, see writeKeyedCache. Stored Windows-side (getLocalCacheDirectory) to avoid a circular
// "resolve the cache dir by spawning the very probe the cache exists to skip". Callers persist only a SUCCESSFUL
// Probe, so a transient WSL failure re-probes next run rather than caching the degraded default.
export const writeWslEnvironmentCache = (filename: string, cache: KeyedCache<string>): void => {
  writeKeyedCache(join(getLocalCacheDirectory(), filename), cache);
};
