import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";

// The row fields a table's primary key is read from, in key order. A key column is matched to its field by identity
// Among the table's columns, so a column the database names differently from its field is still read by its field
export const listKeyFieldNames = (source: SQLiteTable): string[] => {
  const { columns, primaryKeys } = getTableConfig(source);
  // A composite key is declared in the extra configuration, and a single key is the column flagged as primary
  const keyColumns = primaryKeys[0]?.columns ?? columns.filter((column) => column.primary);
  const fields = Object.entries(getTableColumns(source));
  return keyColumns.flatMap((keyColumn) => fields.filter(([, column]) => column === keyColumn).map(([field]) => field));
};
