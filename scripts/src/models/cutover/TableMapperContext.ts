import type { IdMap } from "#src/models/cutover/IdMap";
import type { TableParents } from "#src/models/cutover/TableParents";

// What a mapper reads beside the entity: the ids given so far, the parent rows that exist, and when the entity last changed
export interface TableMapperContext {
  idMap: IdMap;
  parents: TableParents;
  timestamp?: Date;
}
