import type { ReferencingColumn, ReferencingKey } from "#src/models/realtime/ReferencingKey";
import type { Column, Table } from "drizzle-orm";

import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getOrCreate } from "@esposter/shared";
import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// The key a column is held under in its table's definition, which is the name a scope declaration and a returned row use
const getColumnKey = (table: Table, column: Column): string | undefined => {
  const columns = getTableColumns(table);
  return Object.keys(columns).find((key) => columns[key]?.name === column.name);
};

// The columns a foreign key holds, each paired with the column of the referenced row it takes its value from, by position
const getReferencingColumns = (
  table: Table,
  columns: Column[],
  foreignTable: Table,
  foreignColumns: Column[],
): ReferencingColumn[] =>
  columns.flatMap((column, index): ReferencingColumn[] => {
    const referencedColumn = foreignColumns[index];
    const key = getColumnKey(table, column);
    const parentColumn = referencedColumn === undefined ? undefined : getColumnKey(foreignTable, referencedColumn);
    return key !== undefined && parentColumn !== undefined && referencedColumn !== undefined
      ? [{ childColumn: column, column: key, parentColumn, referencedColumn }]
      : [];
  });

// Every foreign key of the schema, keyed by the table it references. Read off each table's declaration, so a key a table
// Declares is in the graph with nothing to register
export const getReferencingKeysByParentName = (): Map<string, ReferencingKey[]> => {
  const tableNameReferencingKeysMap = new Map<string, ReferencingKey[]>();
  for (const table of getSchemaTables())
    for (const foreignKey of getTableConfig(table).foreignKeys) {
      const { columns, foreignColumns, foreignTable } = foreignKey.reference();
      const parentName = getTableName(foreignTable);
      getOrCreate(tableNameReferencingKeysMap, parentName, () => []).push({
        action: foreignKey.onDelete,
        columns: getReferencingColumns(table, columns, foreignTable, foreignColumns),
        table,
      });
    }
  return tableNameReferencingKeysMap;
};
