import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { writeKeyedCache } from "#src/services/exec/util/writeKeyedCache";
import { getWslEnvironmentCachePath } from "#src/services/exec/wsl/getWslEnvironmentCachePath";
// Persist a win32 WSL environment probe result (`filename`) so later `virrun -- <cmd>` processes skip the probe —
// Best-effort and atomic, see writeKeyedCache. Callers persist only a SUCCESSFUL probe, so a transient WSL failure
// Re-probes next run rather than caching the degraded default.
export const writeWslEnvironmentCache = <TValue>(
  filename: string,
  cache: Pick<KeyedCache<TValue>, "key" | "value">,
): void => {
  writeKeyedCache(getWslEnvironmentCachePath(filename), cache);
};
