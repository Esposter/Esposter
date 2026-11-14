import { getResultAsync, noop } from "@esposter/shared";

// Runs `callback` over `items` with at most `concurrency` calls in flight. Each lane takes the next item from one cursor only
// once its own call has settled, so the calls in flight are bounded and a listing is streamed rather than collected. A failure
// stops the items not yet started, and the call rejects with the first failure only once every call in flight has settled.
// The registry readers share this bound rather than each keeping a pool
export const forEachConcurrently = async <T>(
  items: AsyncIterable<T> | Iterable<T>,
  concurrency: number,
  callback: (item: T) => Promise<void>,
): Promise<void> => {
  const cursor = (async function* () {
    yield* items;
  })();
  const failures: Error[] = [];
  const runLane = async (): Promise<void> => {
    for (let next = await cursor.next(); !next.done && failures.length === 0; next = await cursor.next()) {
      const { value } = next;
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: a lane takes its next item only once its call settles
      await getResultAsync(() => callback(value)).match(noop, (error) => {
        failures.push(error);
      });
    }
  };
  const lanes = await Promise.allSettled(Array.from({ length: concurrency }, runLane));
  const rejected = lanes.find((lane) => lane.status === "rejected");
  if (rejected?.status === "rejected") throw rejected.reason;
  const [failure] = failures;
  if (failure) throw failure;
};
