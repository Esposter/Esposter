import { getResultAsync } from "#src/services/error/getResultAsync";
import { getExponentialBackoffDelayMs } from "#src/util/time/getExponentialBackoffDelayMs";
import { sleep } from "#src/util/time/sleep";

// Runs an operation, and after each failure waits longer before the next attempt, until one succeeds and resets the
// Wait. The wait is taken before an attempt rather than after a failure, so the caller decides whether to attempt at all
export const createExponentialBackoff = (
  baseDelayMs: number,
  maxDelayMs: number,
): (<T>(operation: () => Promise<T>) => Promise<T>) => {
  let failureCount = 0;
  return async <T>(operation: () => Promise<T>): Promise<T> => {
    if (failureCount > 0) await sleep(getExponentialBackoffDelayMs(failureCount - 1, baseDelayMs, maxDelayMs));
    return getResultAsync(operation).match(
      (value) => {
        failureCount = 0;
        return value;
      },
      (error) => {
        failureCount += 1;
        throw error;
      },
    );
  };
};
