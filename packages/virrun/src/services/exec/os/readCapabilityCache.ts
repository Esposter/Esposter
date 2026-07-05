import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { readKeyedCache } from "@/services/exec/util/readKeyedCache";
import { join } from "node:path";
import { z } from "zod";
// The persisted os-backend capability verdict for `key` (host fingerprint), or undefined when there is nothing
// Usable to reuse so the caller falls through to a fresh probe — see readKeyedCache. Host-global
// (getGlobalCacheDirectory): the bwrap verdict holds for the whole host. See isOsBackendSupported.
export const readCapabilityCache = (key: string): boolean | undefined =>
  readKeyedCache(join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME), z.boolean(), key);
