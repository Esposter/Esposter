import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getCapabilityCachePath } from "#src/services/exec/os/getCapabilityCachePath";
import { readKeyedCache } from "#src/services/exec/util/readKeyedCache";
import { getResult } from "@esposter/shared";
import { z } from "zod";

// The persisted os-backend capability verdict for `key` (host fingerprint), or undefined when there is nothing
// Usable to reuse so the caller falls through to a fresh probe — see readKeyedCache. Host-global
// (getGlobalCacheDirectory): the bwrap verdict holds for the whole host. See checkIsOsBackendSupported.
// Age-bounded like every other probe cache, and for the same reason: on win32 the verdict comes from a WSL
// Command under a 10s cap, so a cold distro answers `false` for a host that supports the backend perfectly well.
// The fingerprint cannot see that — it keys the kernel, not whether WSL was warm — so an unbounded entry would
// Degrade every later run to the native backend until the kernel changed or the cache was cleaned by hand.
// On win32 the location itself is asked of WSL, so a VM that will not start leaves no cache to read — that is one
// More miss, never a failed run: the probe behind it answers `undefined` for the same VM and the run goes native.
export const readCapabilityCache = (key: string): boolean | undefined =>
  getResult(getCapabilityCachePath).match(
    (file) => readKeyedCache(file, z.boolean(), key),
    ({ message }) => {
      writeVirrunDebug(`capability cache location unresolved, probing instead — ${message}`);
      return undefined;
    },
  );
