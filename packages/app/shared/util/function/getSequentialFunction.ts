import { noop, withFinalizerAsync } from "@esposter/shared";
// Chains calls so each starts only after the previous settles.
// Writes need this ordering guarantee — the latest-wins guard in getConcurrentFunction is only correct for reads, where a stale result is droppable.
export const getSequentialFunction = <T extends unknown[], TResult>(fn: (...args: T) => Promise<TResult>) => {
  let queue: Promise<void> = Promise.resolve();
  return (...args: T): Promise<TResult> => {
    const previous = queue;
    let release = noop;
    queue = new Promise((resolve) => {
      release = resolve;
    });
    return withFinalizerAsync(async () => {
      await previous;
      return fn(...args);
    }, release);
  };
};
