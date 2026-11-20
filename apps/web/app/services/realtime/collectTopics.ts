import type { TopicRead } from "@esposter/db-schema";

import { withFinalizer } from "@esposter/shared";

// The reads the read in flight is collecting, set while a read starts its calls. A tRPC call runs its first link as
// It is made, so the topics link takes this collector then and adds each read its answer names
let activeReads: TopicRead[] | undefined;

export const readActiveTopicReads = (): TopicRead[] | undefined => activeReads;

// Runs a read and collects the reads every tRPC call it starts synchronously answers with. Each read is kept whole, since
// Its signature covers only its own topics, so the reads are watched one by one rather than merged. A call started after the
// Read's first await is outside the collection, so a read that must be live starts its calls before awaiting anything
export const collectTopics = async <T>(read: () => Promise<T>): Promise<{ reads: TopicRead[]; result: T }> => {
  const reads: TopicRead[] = [];
  const previousReads = activeReads;
  activeReads = reads;
  const readPromise = withFinalizer(read, () => {
    activeReads = previousReads;
  });
  const result = await readPromise;
  return { reads, result };
};
