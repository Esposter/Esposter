import { StorageBucket } from "@esposter/db-schema";

// Every container with a bucket of its own. The dead-letter container has none: Event Grid's failed deliveries are replaced by the Queues'
// dead-letter queues, so nothing copies it
export const getCopyBuckets = (): StorageBucket[] => Object.values(StorageBucket);
