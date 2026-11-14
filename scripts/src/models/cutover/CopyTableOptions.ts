import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { TableMapper } from "#src/models/cutover/TableMapper";
import type { TableParents } from "#src/models/cutover/TableParents";

// One Azure Table's copy: where its checkpoint and id map live, the Azure connection it is read through, and whether it is the delta
export interface CopyTableOptions {
  archiveBucket: string;
  client: R2Client;
  connectionString: string;
  delta: boolean;
  executor: D1Executor;
  idMap: IdMap;
  mapper: TableMapper;
  parents: TableParents;
}
