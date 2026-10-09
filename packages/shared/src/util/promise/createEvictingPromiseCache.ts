import { getResultAsync } from "#src/services/error/getResultAsync";

// A memo of one promise per key, for a resource whose first use is expensive and every later use shares. The promise is
// Memoized rather than its resolved value, so concurrent callers share one load instead of racing their own. A rejected
// Load is not remembered, so the next caller retries it. Only the entry this call installed is evicted: a caller that
// Already retried past the rejection keeps the good promise it stored under the same key.
export const createEvictingPromiseCache = <TArguments extends unknown[], TValue>(
  getKey: (...args: TArguments) => string,
  load: (...args: TArguments) => Promise<TValue>,
): ((...args: TArguments) => Promise<TValue>) => {
  const promiseMap = new Map<string, Promise<TValue>>();
  return (...args) => {
    const key = getKey(...args);
    const promise = promiseMap.get(key) ?? load(...args);
    promiseMap.set(key, promise);
    return getResultAsync(() => promise).match(
      (value) => value,
      (error) => {
        if (promiseMap.get(key) === promise) promiseMap.delete(key);
        throw error;
      },
    );
  };
};
