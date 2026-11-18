import type { TopicRead } from "#shared/models/realtime/TopicRead";

import { withFinalizer } from "@esposter/shared";

// The reads the read in flight is collecting, set while a read starts its calls. A tRPC call runs its first link as
// It is made, so the topics link takes this collector then and adds each read its answer names
let activeReads: TopicRead[] | undefined;

export const readActiveTopicReads = (): TopicRead[] | undefined => activeReads;

// The one watch a read's calls make: their topics, watched from the earliest time any of their reads began
const mergeTopicReads = (reads: TopicRead[]): TopicRead | undefined => {
  if (reads.length === 0) return undefined;

  return {
    readAt: Math.min(...reads.map(({ readAt }) => readAt)),
    topics: [...new Set(reads.flatMap(({ topics }) => topics))],
  };
};

// Runs a read and collects the topics every tRPC call it starts synchronously answers with. A call started after the
// Read's first await is outside the collection, so a read that must be live starts its calls before awaiting anything
export const collectTopics = async <T>(
  read: () => Promise<T>,
): Promise<{ read?: TopicRead | undefined; result: T }> => {
  const reads: TopicRead[] = [];
  const previousReads = activeReads;
  activeReads = reads;
  const readPromise = withFinalizer(read, () => {
    activeReads = previousReads;
  });
  const result = await readPromise;
  return { read: mergeTopicReads(reads), result };
};
