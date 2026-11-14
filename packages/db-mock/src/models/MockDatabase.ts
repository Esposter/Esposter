import type { StorageBucket, QueueJob, Database } from "@esposter/db-schema";
import type { MockD1Database } from "#src/models/MockD1Database";
import type { MockQueue } from "#src/models/MockQueue";
import type { MockR2Bucket } from "#src/models/MockR2Bucket";

export interface MockDatabase {
  // The core database, through drizzle over its D1 binding
  db: Database;
  dispose: () => Promise<void>;
  getBucket: (bucket: StorageBucket) => Promise<MockR2Bucket>;
  getQueue: (job: QueueJob) => Promise<MockQueue>;
  // Empties every table of both databases and every bucket, so the next test starts from nothing
  reset: () => Promise<void>;
  // The streams database's raw D1 binding, which the stream table client takes as a parameter
  streamsDb: MockD1Database;
}
