import type { MockD1Database } from "#src/models/MockD1Database";
import type { MockQueue } from "#src/models/MockQueue";
import type { MockR2Bucket } from "#src/models/MockR2Bucket";
import type { Database, QueueJob, StorageBucket } from "@esposter/db-schema";

export interface MockDatabase {
  // The core database's raw D1 binding, which a room object takes as its CORE binding
  coreDatabase: MockD1Database;
  // The core database, through drizzle over its D1 binding
  db: Database;
  dispose: () => Promise<void>;
  getBucket: (bucket: StorageBucket) => Promise<MockR2Bucket>;
  getQueue: (job: QueueJob) => Promise<MockQueue>;
  // Empties every table of the database and every bucket, so the next test starts from nothing
  reset: () => Promise<void>;
}
