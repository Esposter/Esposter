import { CACHE_LIFETIME_MS } from "../constants";

export const getCacheRemainingMs = (lastResponseAt: number, now: number): number =>
  Math.max(0, lastResponseAt + CACHE_LIFETIME_MS - now);
