import type { ReferencingKey } from "#src/models/realtime/ReferencingKey";

import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getOrCreate } from "@esposter/shared";
import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// Every foreign key of the schema, keyed by the table it references. Read off each table's declaration, so a key a table
// Declares is in the graph with nothing to register
export const getReferencingKeysByParentName = (): Map<string, ReferencingKey[]> => {
  const tableNameReferencingKeysMap = new Map<string, ReferencingKey[]>();
  for (const table of getSchemaTables())
    for (const foreignKey of getTableConfig(table).foreignKeys) {
      const parentName = getTableName(foreignKey.reference().foreignTable);
      getOrCreate(tableNameReferencingKeysMap, parentName, () => []).push({ action: foreignKey.onDelete, table });
    }
  return tableNameReferencingKeysMap;
};
