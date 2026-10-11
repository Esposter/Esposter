import type { PackageLookup } from "#src/models/outdatedDependencies/shared/PackageLookup";
import type { SupersessionCacheEntry } from "#src/models/outdatedDependencies/shared/SupersessionCacheEntry";

import { SUPERSESSION_CACHE_MAX_AGE } from "#src/services/outdatedDependencies/supersession/constants";

// Splits the lookups into those the cache holds a fresh read for, and those it must ask again: a missing entry, or one
// Read longer ago than the maximum age
export const partitionCachedLookups = (
  lookups: PackageLookup[],
  cache: Record<string, SupersessionCacheEntry>,
  now: Temporal.Instant,
): { cached: Map<PackageLookup, SupersessionCacheEntry>; uncached: PackageLookup[] } => {
  const cached = new Map<PackageLookup, SupersessionCacheEntry>();
  const uncached: PackageLookup[] = [];

  for (const lookup of lookups) {
    const entry = cache[lookup.cacheKey];
    const isFresh =
      entry !== undefined &&
      Temporal.Duration.compare(now.since(Temporal.Instant.from(entry.readAt)), SUPERSESSION_CACHE_MAX_AGE) <= 0;
    if (isFresh) cached.set(lookup, entry);
    else uncached.push(lookup);
  }

  return { cached, uncached };
};
