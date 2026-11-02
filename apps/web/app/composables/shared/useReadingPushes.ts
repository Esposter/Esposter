import type { SnapshotPush } from "@/models/shared/SnapshotPush";

import { mergeSnapshot } from "@/services/shared/mergeSnapshot";

// The writes that land while a list's read is in flight, kept per read key until the answer is merged with them.
// A read clears its slot only while the slot is still its own, so a later read of the same key keeps its pushes.
export const useReadingPushes = <TItem extends { id: string }, TKey extends PropertyKey = PropertyKey>() => {
  const { executeQuery } = useMutation();
  const readingPushesMap = new Map<TKey, SnapshotPush<TItem>[]>();
  const recordReadingPush = (key: TKey, push: SnapshotPush<TItem>) => {
    readingPushesMap.get(key)?.push(push);
  };
  // The read's answer is merged with the pushes that landed for its key while it was in flight.
  // A response taken before a push would otherwise write the list back without it.
  const readWithReplayedPushes = async (
    key: TKey,
    read: () => Promise<TItem[]>,
    onMerged: (items: TItem[]) => void,
    onError?: (error: Error) => void,
  ) => {
    const readPushes: SnapshotPush<TItem>[] = [];
    readingPushesMap.set(key, readPushes);
    await executeQuery(read, {
      key,
      onError,
      onSuccess: (items) => {
        onMerged(mergeSnapshot(items, readPushes));
      },
    });
    if (readingPushesMap.get(key) === readPushes) readingPushesMap.delete(key);
  };
  return { readWithReplayedPushes, recordReadingPush };
};
