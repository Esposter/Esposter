import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { listKeyFieldNames } from "@esposter/db-schema";
import { getTableColumns } from "drizzle-orm";

// The columns a write's RETURNING is widened with, so the rows it names carry what their topics and their row versions are
// Named by: a scoped table's scope columns, the primary key fields its row versions name a row by, and its version. An
// Unscoped table is widened with none, as no topic names its rows and no row version is named for it
export const getWidenedKeys = (table: SQLiteTable): string[] => {
  const scopeKeys = getScopeKeys(table);
  if (scopeKeys.length === 0) return [];
  const keys = [...scopeKeys, ...listKeyFieldNames(table)];
  return [...new Set("version" in getTableColumns(table) ? [...keys, "version"] : keys)];
};
