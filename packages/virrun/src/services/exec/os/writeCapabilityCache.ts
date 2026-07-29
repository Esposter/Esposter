import type { KeyedCache } from "@/models/exec/KeyedCache";

import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { writeKeyedCache } from "@/services/exec/util/writeKeyedCache";
import { join } from "node:path";
// Persist the probe's verdict so later `virrun -- <cmd>` processes skip the bwrap probe — best-effort and atomic,
// See writeKeyedCache. Host-global (getGlobalCacheDirectory): the verdict holds for the whole host.
export const writeCapabilityCache = (cache: Pick<KeyedCache<boolean>, "key" | "value">): void => {
  writeKeyedCache(join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME), cache);
};
