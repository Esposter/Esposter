import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { readKeyedCache } from "@/services/exec/util/readKeyedCache";
import { join } from "node:path";
import { z } from "zod";
// The persisted win32 WSL environment probe result (`filename`) for `key`, or undefined when there is nothing usable
// To reuse so the caller falls through to a fresh probe — see readKeyedCache. Stored Windows-side
// (getLocalCacheDirectory), since resolving the WSL ext4 root is itself one of the probes this caches.
export const readWslEnvironmentCache = (filename: string, key: string): string | undefined =>
  readKeyedCache(join(getLocalCacheDirectory(), filename), z.string(), key);
