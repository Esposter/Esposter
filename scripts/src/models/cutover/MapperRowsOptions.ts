import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { MapperEntity } from "#src/models/cutover/MapperEntity";
import type { TableMapper } from "#src/models/cutover/TableMapper";
import type { TableParents } from "#src/models/cutover/TableParents";

// What a pass over one table's entities writes with: the typed table, the mapper, the ids and parents it reads, and the entities
export interface MapperRowsOptions {
  coreTable: CoreTable;
  entities: AsyncIterable<MapperEntity>;
  executor: D1Executor;
  idMap: IdMap;
  mapper: TableMapper;
  parents: TableParents;
}
