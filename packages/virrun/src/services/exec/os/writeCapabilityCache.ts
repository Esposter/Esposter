import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getCapabilityCachePath } from "#src/services/exec/os/getCapabilityCachePath";
import { writeKeyedCache } from "#src/services/exec/util/writeKeyedCache";
import { getResult } from "@esposter/shared";

// Persist the probe's verdict so later `virrun -- <cmd>` processes skip the bwrap probe — best-effort and atomic,
// See writeKeyedCache. Best-effort reaches the location too: on win32 it is asked of WSL (see readCapabilityCache).
export const writeCapabilityCache = (cache: Pick<KeyedCache<boolean>, "key" | "value">): void => {
  getResult(getCapabilityCachePath).match(
    (file) => {
      writeKeyedCache(file, cache);
    },
    ({ message }) => {
      writeVirrunDebug(`capability cache location unresolved, verdict not written — ${message}`);
    },
  );
};
