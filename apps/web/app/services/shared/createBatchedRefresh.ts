import { BATCHED_REFRESH_BASE_DELAY_MS, BATCHED_REFRESH_MAX_DELAY_MS } from "@/services/shared/constants";
import { createSingleFlight } from "@/services/shared/createSingleFlight";
import { createExponentialBackoff, getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// A server that stays down is not asked forever: past this many retries in a row the keys stay dirty until the next mark
const MAX_RETRIES = 5;

// Re-reads the keys marked as changed, one run at a time. A key marked while a run is in flight is taken by the run
// Owed after it, so a change is read once however many marks land during a run, and no two reads of the same keys
// Overlap — the one to finish last is always the newest. A run that fails puts its keys back and schedules one more
// Run, paced by the backoff, so a failed read recovers without the next mark having to come
export const createBatchedRefresh = <TKey>(refresh: (keys: TKey[]) => Promise<void>) => {
  const dirtyKeys = new Set<TKey>();
  const executeWithBackoff = createExponentialBackoff(BATCHED_REFRESH_BASE_DELAY_MS, BATCHED_REFRESH_MAX_DELAY_MS);
  let retryCount = 0;
  const flush = createSingleFlight(async () => {
    const keys = [...dirtyKeys];
    // A retry scheduled before a mark was read by the run that mark started finds nothing left to read
    if (keys.length === 0) return;

    dirtyKeys.clear();
    await getResultAsync(() => executeWithBackoff(() => refresh(keys))).match(
      () => {
        retryCount = 0;
      },
      (error) => {
        for (const key of keys) dirtyKeys.add(key);
        console.error(error);
        if (retryCount >= MAX_RETRIES) return;

        retryCount += 1;
        // The backoff sleeps before the run it starts, so the retry is scheduled at once and paced by it
        setTimeout(getSynchronizedFunction(flush), 0);
      },
    );
  });
  return (keys: TKey[]) => {
    for (const key of keys) dirtyKeys.add(key);
    return flush();
  };
};
