import type { z } from "zod";

import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { readKeyedCache } from "@/services/exec/util/readKeyedCache";
import { join } from "node:path";
// The persisted win32 WSL environment probe result (`filename`) for `key`, or undefined when there is nothing usable
// To reuse so the caller falls through to a fresh probe — see readKeyedCache, including the optional `maxAgeMs` a
// Probe whose subject can drift without changing the key passes. Stored Windows-side (getLocalCacheDirectory), since
// Resolving the WSL ext4 root is itself one of the probes this caches.
export const readWslEnvironmentCache = <TValue>(
  filename: string,
  valueSchema: z.ZodType<TValue>,
  key: string,
  maxAgeMs?: number,
): TValue | undefined => readKeyedCache(join(getLocalCacheDirectory(), filename), valueSchema, key, maxAgeMs);
