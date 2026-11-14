import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";
import type { TableLink } from "#src/models/cutover/TableLink";
import type { TableMapperContext } from "#src/models/cutover/TableMapperContext";
import type { D1Value } from "#src/services/cutover/core/toD1Value";
import type { StreamTable } from "@esposter/db-schema";

// One mapper per Azure Table, in services/cutover/tables/. Each reads the legacy entity field by field, so the typed schema is
// the only place a column is named. `map` returns undefined for an entity whose parent is gone: the cascade that removed the
// parent would have removed it, so it is not copied
export interface TableMapper {
  azureTable: StreamTable;
  // A query returning one row per partition, as `partitionKey` and `count`, that verify compares with the entities of each partition
  countByPartitionSql: string;
  // The SQLite name of the typed table the entities become
  coreTable: string;
  // A reference to another row, set once every row it may name is written
  link?: (entity: LegacyEntity, context: TableMapperContext) => TableLink | undefined;
  map: (entity: LegacyEntity, context: TableMapperContext) => Record<string, D1Value> | undefined;
}
