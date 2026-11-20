import type { TopicRead } from "@esposter/db-schema";

import { useConnectionStore } from "#src/store/realtime/connection";
import { noop } from "@esposter/shared";

interface TopicsWatch {
  unwatch: () => void;
}

// Keeps the topics a read came from watched for as long as the scope that made the read lives, one watch per target, of
// Every read the target's calls made. A scope is the surface or the store the read belongs to: a read made with none has
// Nothing to release its watch, so it takes none. A target read again takes a watch of the new reads, each signed for it, and
// Lets go of the ones it replaces after the new ones are taken, so no topic both name is unwatched between them. The connection
// Store sends a read only when it adds to what the socket holds, so a read of the same topics costs no frame. A read that
// Answers after its scope has gone takes no watch either
export const useWatchTopics = () => {
  const connectionStore = import.meta.client && getCurrentScope() ? useConnectionStore() : undefined;
  const topicsWatchMap = new Map<PropertyKey, TopicsWatch>();
  let isDisposed = false;
  if (connectionStore)
    onScopeDispose(() => {
      isDisposed = true;
      for (const { unwatch } of topicsWatchMap.values()) unwatch();
      topicsWatchMap.clear();
    });
  return (target: PropertyKey, reads: TopicRead[] | undefined, refetch: () => void) => {
    if (!connectionStore || isDisposed) return;

    const previousTopicsWatch = topicsWatchMap.get(target);
    if (!reads?.length) {
      previousTopicsWatch?.unwatch();
      topicsWatchMap.delete(target);
      return;
    }

    const newTopicsWatch: TopicsWatch = { unwatch: noop };
    // Every read hands the same refetch, which the connection store dedupes by identity, so a change refetches the query once
    const unwatchReads = reads.map((read) => connectionStore.watchTopics(read, refetch));
    newTopicsWatch.unwatch = () => {
      for (const unwatchRead of unwatchReads) unwatchRead();
    };
    previousTopicsWatch?.unwatch();
    topicsWatchMap.set(target, newTopicsWatch);
  };
};
