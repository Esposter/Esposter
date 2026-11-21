import type { SQLWrapper } from "drizzle-orm";

import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { is } from "drizzle-orm";
import { SQLiteDeleteBase, SQLiteInsertBase, SQLiteTable, SQLiteUpdateBase } from "drizzle-orm/sqlite-core";

// The table a write changes: an insert, an update or a delete names one. A select, a count or a query names none
export const getWriteTable = (statement: SQLWrapper): SQLiteTable | undefined => {
  if (!is(statement, SQLiteInsertBase) && !is(statement, SQLiteUpdateBase) && !is(statement, SQLiteDeleteBase))
    return undefined;
  const table = getStatementConfig(statement)?.table;
  return is(table, SQLiteTable) ? table : undefined;
};
