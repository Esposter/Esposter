import type { Table } from "drizzle-orm";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getTableColumns } from "drizzle-orm";

// The columns a write's RETURNING is widened with, so the rows it names carry what their topics and their row versions are
// Named by: a scoped table's scope columns, and its version. An unscoped table is widened with none, as no topic names its rows
export const getWidenedKeys = (table: Table): string[] => {
  const scopeKeys = getScopeKeys(table);
  if (scopeKeys.length === 0) return [];
  return "version" in getTableColumns(table) ? [...scopeKeys, "version"] : scopeKeys;
};
