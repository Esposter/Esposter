import type { Topic } from "@esposter/db-schema";

import { withFinalizer } from "@esposter/shared";

// The topics the read in flight is collecting, set while a read starts its calls. A tRPC call runs its first link as
// It is made, so the topics link takes this collector then and fills it once the call's answer names its topics
let activeTopics: Topic[] | undefined;

export const readActiveTopics = (): Topic[] | undefined => activeTopics;

// Runs a read and collects the topics every tRPC call it starts synchronously answers with. A call started after the
// Read's first await is outside the collection, so a read that must be live starts its calls before awaiting anything
export const collectTopics = async <T>(read: () => Promise<T>): Promise<{ result: T; topics: Topic[] }> => {
  const topics: Topic[] = [];
  const previousTopics = activeTopics;
  activeTopics = topics;
  const readPromise = withFinalizer(read, () => {
    activeTopics = previousTopics;
  });
  return { result: await readPromise, topics };
};
