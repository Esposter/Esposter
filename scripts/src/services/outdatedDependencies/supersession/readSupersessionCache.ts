import type { SupersessionCacheEntry } from "#src/models/outdatedDependencies/shared/SupersessionCacheEntry";

import { SUPERSESSION_CACHE_PATH } from "#src/services/outdatedDependencies/supersession/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The verdicts a previous run kept, by cache key. A cache that is missing or unreadable is an empty one, so a miss
// Costs only the lookups it would have saved.
export const readSupersessionCache = (): Record<string, SupersessionCacheEntry> =>
  getResult(() =>
    parseMachineJson<Record<string, SupersessionCacheEntry>>(readFileSync(SUPERSESSION_CACHE_PATH, "utf8")),
  ).match(
    (cache) => cache,
    () => ({}),
  );
