import { CacheTag } from "#src/models/cache/CacheTag";
import { useCacheStore } from "#src/store/cache";

// The tail every write of a resource row runs, kept or refused. The Resources tag goes stale, since the stars and the Recent
// Rows carry what a write changed, and the list the write shows re-reads, since its total and its page's membership are the
// Server's to say and not the rows the write moved
export const useResourceWriteFinalizer = (refresh?: () => Promise<void>) => {
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  return async () => {
    await invalidateTags([CacheTag.Resources]);
    await refresh?.();
  };
};
