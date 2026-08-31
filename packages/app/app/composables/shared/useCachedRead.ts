import type { CacheTag } from "@/models/cache/CacheTag";

import { useCacheStore } from "@/store/cache";

// A session-scoped cache holds one entry, so it needs no key of its own — the keyed form is the general case
// And this is that form with a single, unnamed key
const DEFAULT_CACHE_KEY = "";

interface CachedReadOptions<TResult> {
  // Whether an invalidation re-reads at once or only drops the entry, declared once per cache instead of
  // Judged at every call site that invalidates it. A cache whose surface is mounted when its tag changes has
  // To be right on screen immediately (favorites — its stars render in the very table a delete is issued
  // From); every other cache would spend a round trip on data nothing is showing, so it re-reads when
  // Something next mounts. Only for a session-scoped cache, whose single entry exists from cold
  isRefetchOnInvalidate?: true;
  onError?: (error: Error) => void;
  // The caller owns what the response writes: one read can populate two maps, or a data ref and an error ref
  onSuccess: (result: TResult, key: string) => void;
  tags?: CacheTag[];
}
// Read-once-per-session (or per key), which single-flight cannot cover: a settled read is no longer in flight
// To join. This is the caching layer on top of `executeQuery`, never a replacement for it — the gate decides
// Whether to call at all, and `isExclusive` still collapses the concurrent first callers into one request.
// A cache is shared data, so it belongs to a store: an instance per component would cache per component,
// Which is what `useQuery` already is
export const useCachedRead = <TResult>(
  query: (key: string) => Promise<TResult>,
  { isRefetchOnInvalidate, onError, onSuccess, tags = [] }: CachedReadOptions<TResult>,
) => {
  const cacheStore = useCacheStore();
  const { registerCache } = cacheStore;
  const { executeQuery, isPending, supersedeKey } = useMutation();
  const loadedKeys = new Set<string>();
  const executeRead = async (key: string, isExclusive?: true) => {
    await executeQuery(() => query(key), {
      isExclusive,
      key,
      onError,
      onSuccess: (result) => {
        // Loaded on success only: a failed read leaves the entry open so the next mount — or the surface's own
        // Retry — reissues it, rather than caching the failure as "loaded and empty" for the session
        loadedKeys.add(key);
        onSuccess(result, key);
      },
    });
  };
  // What every surface calls on mount. The concurrent first callers join one request through the primitive's
  // Single-flight, and every caller after the entry lands issues nothing at all
  const read = async (key = DEFAULT_CACHE_KEY) => {
    if (loadedKeys.has(key)) return;

    await executeRead(key, true);
  };
  // An unconditional re-read, deliberately not single-flight: a read issued *because* something changed must
  // Not join the answer that the change just invalidated — it supersedes it on latest-wins instead
  const refetch = async (key = DEFAULT_CACHE_KEY) => {
    loadedKeys.delete(key);
    await executeRead(key);
  };
  // A value the caller got from somewhere other than this cache — a subscription push carrying the whole
  // Entry — supersedes any read still in flight for that key, through the same latest-wins two reads settle
  // By. The entry counts as loaded from then on: the caller is holding the current value, so the next mount
  // Would spend a round trip to be told what it already knows
  const supersede = (key = DEFAULT_CACHE_KEY) => {
    loadedKeys.add(key);
    supersedeKey(key);
  };
  if (tags.length > 0)
    registerCache(tags, async () => {
      const invalidatedKeys = [...loadedKeys];
      loadedKeys.clear();
      if (!isRefetchOnInvalidate) return;
      // A session-scoped cache's one entry exists whether or not anything has read it, so it re-reads from
      // Cold too: the surface mounting next must find the new set rather than be the thing that discovers it
      await Promise.all(
        (invalidatedKeys.length > 0 ? invalidatedKeys : [DEFAULT_CACHE_KEY]).map((key) => executeRead(key)),
      );
    });
  // The instance reads one cache, so the primitive's pending state is this cache's loading flag
  return { isPending, read, refetch, supersede };
};
