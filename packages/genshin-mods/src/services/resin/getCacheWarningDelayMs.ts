import { CACHE_WARNING_MS } from "../constants";
import { getCacheRemainingMs } from "./getCacheRemainingMs";

// How long from `now` until the cache warning is due: the instant the cache goes cold less the warning margin.
// Nothing is due while no request has read or written the cache, and a deadline already past the margin is due at once
export const getCacheWarningDelayMs = (lastCacheRequestAt: number, now: number): number | undefined =>
  lastCacheRequestAt > 0 ? Math.max(0, getCacheRemainingMs(lastCacheRequestAt, now) - CACHE_WARNING_MS) : undefined;
