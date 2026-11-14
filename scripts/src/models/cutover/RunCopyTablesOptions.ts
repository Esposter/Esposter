import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { R2Client } from "#src/models/cutover/R2Client";

// The copy of every mapped Azure Table: the archive bucket, the R2 client, the Azure connection and the D1 executor
export interface RunCopyTablesOptions {
  archiveBucket: string;
  client: R2Client;
  connectionString: string;
  delta: boolean;
  executor: D1Executor;
}
