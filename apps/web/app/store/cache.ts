import type { CacheTag } from "@/models/cache/CacheTag";
import type { Promisable } from "type-fest";

import { getOrCreate } from "@esposter/shared";

// The registry a cached read declares itself to and a write invalidates through, so neither side knows the
// Other: a new cached set is one `tags` entry, and no composable enumerates which caches a mutation touches.
// It is a store rather than a module-level Map because a module map is shared across Pinia instances — it
// Would leak registrations between tests and, on the server, between one request's app and the next's
export const useCacheStore = defineStore("cache", () => {
  const invalidatorMap = new Map<CacheTag, Set<() => Promisable<void>>>();
  const registerCache = (tags: CacheTag[], invalidate: () => Promisable<void>) => {
    for (const tag of tags) getOrCreate(invalidatorMap, tag, () => new Set()).add(invalidate);
  };
  // Awaited rather than fired and forgotten: a cache that re-reads on invalidation has to have landed by the
  // Time the write that invalidated it resolves, or the surface that triggered the write renders the old set
  const invalidateTags = async (tags: CacheTag[]) => {
    // A cache carrying two of the invalidated tags is dropped once, so it issues one re-read rather than two
    const invalidators = new Set(tags.flatMap((tag) => [...(invalidatorMap.get(tag) ?? [])]));
    await Promise.all(Array.from(invalidators, (invalidate) => Promise.resolve(invalidate())));
  };
  return { invalidateTags, registerCache };
});
