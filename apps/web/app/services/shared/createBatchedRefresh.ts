import { createSingleFlight } from "@/services/shared/createSingleFlight";
import { getResultAsync, noop } from "@esposter/shared";

// Re-reads the keys marked as changed, one run at a time. A key marked while a run is in flight is taken by the run
// Owed after it, so a change is read once however many marks land during a run, and no two reads of the same keys
// Overlap — the one to finish last is always the newest. A run that fails puts its keys back, so the next mark retries
export const createBatchedRefresh = <TKey>(refresh: (keys: TKey[]) => Promise<void>) => {
  const dirtyKeys = new Set<TKey>();
  const flush = createSingleFlight(async () => {
    const keys = [...dirtyKeys];
    dirtyKeys.clear();
    await getResultAsync(() => refresh(keys)).match(noop, (error) => {
      for (const key of keys) dirtyKeys.add(key);
      console.error(error);
    });
  });
  return (keys: TKey[]) => {
    for (const key of keys) dirtyKeys.add(key);
    return flush();
  };
};
