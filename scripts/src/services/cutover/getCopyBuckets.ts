import { StorageBucket } from "@esposter/db-schema";

// Every container with a bucket of its own, except the dead-letter container: Event Grid's failed deliveries, which the
// Queues' dead-letter queues replace and nothing copies
export const getCopyBuckets = (): StorageBucket[] =>
  Object.values(StorageBucket).filter((bucket) => bucket !== StorageBucket.DeadLetter);
