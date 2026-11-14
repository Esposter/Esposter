import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { R2Client } from "#src/models/cutover/R2Client";

// The typed-table verify: the archive that holds the id map, the R2 client, the Azure connection and the D1 executor
export interface VerifyTypedTablesOptions {
  archiveBucket: string;
  client: R2Client;
  connectionString: string;
  executor: D1Executor;
}
