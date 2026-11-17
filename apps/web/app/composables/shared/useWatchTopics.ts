import type { Topic } from "@esposter/db-schema";

import { useConnectionStore } from "#src/store/realtime/connection";
import { ID_SEPARATOR, noop } from "@esposter/shared";

interface TopicsWatch {
  refetch: () => void;
  topicsKey: string;
  unwatch: () => void;
}

// Keeps the topics a read came from watched for as long as the scope that made the read lives, one watch per target.
// A scope is the surface or the store the read belongs to: a read made with none has nothing to release its watch,
// So it takes none. A target read again keeps its watch when it names the same topics, and its newest refetch is the
// One that runs; a read that answers after its scope has gone takes no watch either
export const useWatchTopics = () => {
  const connectionStore = import.meta.client && getCurrentScope() ? useConnectionStore() : undefined;
  const topicsWatchMap = new Map<unknown, TopicsWatch>();
  let isDisposed = false;
  if (connectionStore)
    onScopeDispose(() => {
      isDisposed = true;
      for (const { unwatch } of topicsWatchMap.values()) unwatch();
      topicsWatchMap.clear();
    });
  return (target: unknown, topics: Topic[], refetch: () => void) => {
    if (!connectionStore || isDisposed) return;

    const topicsKey = [...new Set(topics)].toSorted().join(ID_SEPARATOR);
    const topicsWatch = topicsWatchMap.get(target);
    if (topicsWatch?.topicsKey === topicsKey) {
      topicsWatch.refetch = refetch;
      return;
    }

    topicsWatch?.unwatch();
    if (topics.length === 0) {
      topicsWatchMap.delete(target);
      return;
    }

    const newTopicsWatch: TopicsWatch = { refetch, topicsKey, unwatch: noop };
    newTopicsWatch.unwatch = connectionStore.watchTopics(topics, () => {
      newTopicsWatch.refetch();
    });
    topicsWatchMap.set(target, newTopicsWatch);
  };
};
