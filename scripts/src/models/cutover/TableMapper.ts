import type { D1Value } from "#src/services/cutover/core/toD1Value";
import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";
import type { StreamTable } from "@esposter/db-schema";

// One typed row an Azure entity becomes: its D1 table, and its column values already in the D1 form. A mapper may emit
// several (a message and its reactions, say); the first is the entity's own row, whose id is the derived one
export interface MappedRow {
  table: string;
  values: Record<string, D1Value>;
}

// One mapper per Azure Table, in scripts/src/cutover/tables/. Each reads the legacy entity field by field, so the typed
// schema is the only place a column is named
export interface TableMapper {
  azureTable: StreamTable;
  map: (entity: LegacyEntity) => MappedRow[];
}
