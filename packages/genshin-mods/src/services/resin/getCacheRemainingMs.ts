import { CACHE_LIFETIME_MS } from "../constants";

export const getCacheRemainingMs = (lastCacheRequestAt: number, now: number): number =>
  Math.max(0, lastCacheRequestAt + CACHE_LIFETIME_MS - now);
