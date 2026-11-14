import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { R2Client } from "#src/models/cutover/R2Client";

// The copy of the messages and every mapped Azure Table: the archive bucket, the R2 client, the
// Azure connection and Postgres, the functions Worker that holds the rooms' objects, and the D1 executor
export interface RunCopyTablesOptions {
  archiveBucket: string;
  client: R2Client;
  connectionString: string;
  delta: boolean;
  executor: D1Executor;
  functionsUrl: string;
  secret: string;
  // The old estate's Postgres, read in the freeze for its pending scheduled messages
  sourceDatabaseUrl: string;
}
