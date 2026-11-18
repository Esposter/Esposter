import type { SQLWrapper } from "drizzle-orm";

import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getTableColumns, getTableName } from "drizzle-orm";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";

// The name of every column of every table, which a bare word in a statement's SQL may be
const schemaColumnNames = new Set(
  getSchemaTables().flatMap((table) => Object.values(getTableColumns(table)).map(({ name }) => name)),
);

// The columns of a table that a statement's SQL names. A drizzle statement renders each column it reads after its table or
// Alias, quoted, so a column is named when its quoted name follows a dot. Another table's column of the same name is named too,
// Which wakes a read more often and never less. A raw fragment names its columns in bare text, outside the quoted names, so
// When a bare word is a column of any table, every column of this table is named
export const getReferencedColumns = (statement: SQLWrapper, tableName: string): string[] => {
  const table = getSchemaTables().find((schemaTable) => getTableName(schemaTable) === tableName);
  if (!table) return [];
  const { sql } = new SQLiteDialect().sqlToQuery(statement.getSQL());
  const columnNames = Object.values(getTableColumns(table)).map(({ name }) => name);
  const bareWords = sql.replaceAll(/"[^"]*"/gu, " ").match(/[A-Za-z_]\w*/gu) ?? [];
  if (bareWords.some((word) => schemaColumnNames.has(word))) return columnNames;
  return columnNames.filter((name) => sql.includes(`."${name}"`));
};
