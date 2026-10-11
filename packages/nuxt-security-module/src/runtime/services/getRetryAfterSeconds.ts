import type { RateLimiterOptions } from "#src/models/RateLimiterOptions";
import type { RateLimiterStore } from "#src/models/RateLimiterStore";

const MILLISECONDS_PER_SECOND = 1000;

// The seconds a refused request is told to wait, or `undefined` when the request is within its window's count.
// At least one second, as `Retry-After` is never zero
export const getRetryAfterSeconds = async (
  store: RateLimiterStore,
  key: string,
  { intervalInMilliseconds, tokensPerInterval }: RateLimiterOptions,
): Promise<number | undefined> => {
  const { count, resetAt } = await store.increment(key, intervalInMilliseconds);
  if (count <= tokensPerInterval) return undefined;

  return Math.max(1, Math.ceil((resetAt - Date.now()) / MILLISECONDS_PER_SECOND));
};
