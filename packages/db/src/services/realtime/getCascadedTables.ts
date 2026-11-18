import type { Table } from "drizzle-orm";

import { getReferencingKeysByParentName } from "#src/services/realtime/getReferencingKeysByParentName";
import { getTableName } from "drizzle-orm";

// Read once per isolate: the foreign-key graph is the schema's, and it does not change while the isolate runs
const tableNameReferencingKeysMap = getReferencingKeysByParentName();

// The other tables a delete of this table's rows changes. A cascading key removes the child rows it holds, so the child
// Is removed too and its own children are walked in turn. A key that sets the child's value to null or to its default
// Changes those rows without removing them, so the child is changed and nothing beneath it is. The table itself is left out
export const getCascadedTables = (table: Table): Table[] => {
  const tableName = getTableName(table);
  const removedTables: Table[] = [table];
  const removedTableNames = new Set([tableName]);
  const changedTables = new Map<string, Table>();
  for (const removedTable of removedTables) {
    const referencingKeys = tableNameReferencingKeysMap.get(getTableName(removedTable)) ?? [];
    for (const { action, table: referencingTable } of referencingKeys) {
      const referencingTableName = getTableName(referencingTable);
      if (action === "cascade" && !removedTableNames.has(referencingTableName)) {
        removedTableNames.add(referencingTableName);
        removedTables.push(referencingTable);
      }
      if (action === "cascade" || action === "set null" || action === "set default")
        changedTables.set(referencingTableName, referencingTable);
    }
  }
  changedTables.delete(tableName);
  return [...changedTables.values()];
};
