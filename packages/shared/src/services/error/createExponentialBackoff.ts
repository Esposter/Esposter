import { getResultAsync } from "@/services/error/getResultAsync";
import { sleep } from "@/util/time/sleep";

// Paces a repeatedly-invoked fallible operation (e.g. a waypoint-driven pagination fetch):
// each consecutive failure doubles the delay before the next attempt, a success resets it
export const createExponentialBackoff = (
  baseDelayMs: number,
  maxDelayMs: number,
): (<T>(operation: () => Promise<T>) => Promise<T>) => {
  let failureCount = 0;
  return async <T>(operation: () => Promise<T>): Promise<T> => {
    if (failureCount > 0) await sleep(Math.min(baseDelayMs * 2 ** (failureCount - 1), maxDelayMs));
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
