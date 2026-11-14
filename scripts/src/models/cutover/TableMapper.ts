import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";
import type { TableMapperContext } from "#src/models/cutover/TableMapperContext";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

// One mapper per Azure Table, in services/cutover/tables/. Each reads the legacy entity field by field, and the typed schema
// Is the only place a column is named. `toRow` returns undefined for an entity whose parent is gone: the cascade that removed the
// Parent would have removed it, so it is not copied
export interface TableMapper {
  azureTable: LegacyAzureTable;
  // The SQLite name of the typed table the entities become
  coreTable: string;
  // A query returning one row per partition, as `partitionKey` and `count`, that verify compares with the entities of each partition
  countByPartitionSql: string;
  toRow: (entity: LegacyEntity, context: TableMapperContext) => Record<string, D1Value> | undefined;
}
