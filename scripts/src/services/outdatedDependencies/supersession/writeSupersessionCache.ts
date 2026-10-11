import type { SupersessionCacheEntry } from "#src/models/outdatedDependencies/shared/SupersessionCacheEntry";

import { SUPERSESSION_CACHE_PATH } from "#src/services/outdatedDependencies/supersession/constants";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const writeSupersessionCache = (cache: Record<string, SupersessionCacheEntry>): void => {
  mkdirSync(dirname(SUPERSESSION_CACHE_PATH), { recursive: true });
  writeFileSync(SUPERSESSION_CACHE_PATH, JSON.stringify(cache));
};
