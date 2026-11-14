import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";

// The typed-table verify: the id map the copy gave every row, the Azure connection and the D1 executor
export interface VerifyTypedTablesOptions {
  connectionString: string;
  executor: D1Executor;
  idMap: IdMap;
}
