import type { CapabilityCache } from "@/models/exec/CapabilityCache";

import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getResult } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Persist the probe's verdict so later `virrun -- <cmd>` processes skip the probe. Best-effort: a failure to write
// (read-only home, missing cache root on an exotic host) must never fail the command — the only cost is re-probing
// Next time — so the write is wrapped in getResult and its error discarded. The cache root is created lazily here
// Because a host that has never captured a snapshot has no ~/.virrun yet on the first probe.
export const writeCapabilityCache = (cache: CapabilityCache): void => {
  getResult(() => {
    const cacheDirectory = getGlobalCacheDirectory();
    mkdirSync(cacheDirectory, { recursive: true });
    writeFileSync(join(cacheDirectory, CAPABILITY_CACHE_FILENAME), JSON.stringify(cache));
  }).unwrapOr(undefined);
};
