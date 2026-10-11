import { takeOne } from "@esposter/shared";

// Every worker takes the next item from one shared cursor only once its own call has settled, so the calls in flight
// Are bounded by `concurrency` and nothing is copied. The registry readers share this bound rather than each keeping a pool.
export const forEachConcurrently = async <T>(
  items: T[],
  concurrency: number,
  callback: (item: T) => Promise<void>,
): Promise<void> => {
  let nextIndex = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    for (;;) {
      if (nextIndex >= items.length) return;
      const item = takeOne(items, nextIndex);
      nextIndex += 1;
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each worker takes the next item only after its call settles
      await callback(item);
    }
  });

  await Promise.all(workers);
};
