import type { Table } from "drizzle-orm";

import { tableNameReferencingKeysMap } from "#src/services/realtime/tableNameReferencingKeysMap";
import { getTableName } from "drizzle-orm";

export interface CascadeWalk {
  // The tables a delete changes beyond its own rows, each once: a cascade removes rows from its child, and a key that sets the
  // Child's value to null or to its default changes the child, so the deleted table is left out of this list
  changedTables: Table[];
  // The tables a delete removes rows from, the deleted table included
  removedTables: Table[];
}

// The tables a delete of a table's rows reaches through the foreign-key graph. A cascading key removes the child rows it
// Holds, so the child is removed too and its own children are walked in turn. A key that sets the child's value to null or
// To its default changes those rows without removing them, so the child is changed and nothing beneath it is
export const walkCascade = (table: Table): CascadeWalk => {
  const tableName = getTableName(table);
  const removedTables: Table[] = [table];
  const removedTableNames = new Set([tableName]);
  const changedTableMap = new Map<string, Table>();
  for (const removedTable of removedTables) {
    const referencingKeys = tableNameReferencingKeysMap.get(getTableName(removedTable)) ?? [];
    for (const { action, table: referencingTable } of referencingKeys) {
      const referencingTableName = getTableName(referencingTable);
      if (action === "cascade" && !removedTableNames.has(referencingTableName)) {
        removedTableNames.add(referencingTableName);
        removedTables.push(referencingTable);
      }
      if (action === "cascade" || action === "set null" || action === "set default")
        changedTableMap.set(referencingTableName, referencingTable);
    }
  }
  changedTableMap.delete(tableName);
  return { changedTables: [...changedTableMap.values()], removedTables };
};
