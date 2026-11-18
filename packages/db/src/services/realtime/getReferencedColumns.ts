import type { SQLWrapper } from "drizzle-orm";

import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getTableColumns, getTableName } from "drizzle-orm";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";

// The columns of a table that a statement's SQL names. A drizzle statement renders each column it reads after its table or
// Alias, quoted, so a column is named when its quoted name follows a dot. Another table's column of the same name is named too,
// Which wakes a read more often and never less
export const getReferencedColumns = (statement: SQLWrapper, tableName: string): string[] => {
  const table = getSchemaTables().find((schemaTable) => getTableName(schemaTable) === tableName);
  if (!table) return [];
  const { sql } = new SQLiteDialect().sqlToQuery(statement.getSQL());
  return Object.values(getTableColumns(table))
    .map(({ name }) => name)
    .filter((name) => sql.includes(`."${name}"`));
};
