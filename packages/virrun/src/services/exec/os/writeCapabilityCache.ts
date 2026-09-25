import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { getCapabilityCachePath } from "#src/services/exec/os/getCapabilityCachePath";
import { writeKeyedCache } from "#src/services/exec/util/writeKeyedCache";
// Persist the probe's verdict so later `virrun -- <cmd>` processes skip the bwrap probe — best-effort and atomic,
// See writeKeyedCache.
export const writeCapabilityCache = (cache: Pick<KeyedCache<boolean>, "key" | "value">): void => {
  writeKeyedCache(getCapabilityCachePath(), cache);
};
