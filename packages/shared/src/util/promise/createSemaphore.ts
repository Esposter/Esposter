import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { withFinalizerAsync } from "#src/services/error/withFinalizerAsync";

// Runs each task once one of `slots` is free and queues the rest behind it. A task that finishes, rejected or thrown alike,
// Hands its slot straight to the longest-waiting caller, so the queue drains in the order it formed and no timer checks it.
// A slot count below one would queue every task forever, so it is refused where the semaphore is made
export const createSemaphore = (slots: number): (<T>(task: () => Promise<T>) => Promise<T>) => {
  if (!Number.isInteger(slots) || slots < 1)
    throw new InvalidOperationError(
      Operation.Read,
      createSemaphore.name,
      "the slot count is not a whole number of at least one",
    );

  let freeCount = slots;
  const waiters: (() => void)[] = [];
  const acquire = (): Promise<void> => {
    if (freeCount > 0) {
      freeCount -= 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      waiters.push(resolve);
    });
  };
  const release = (): void => {
    const next = waiters.shift();
    // A waiter takes the slot as it is, so the free count does not move
    if (next === undefined) freeCount += 1;
    else next();
  };
  return async <T>(task: () => Promise<T>): Promise<T> => {
    await acquire();
    return withFinalizerAsync(task, release);
  };
};
