import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { Table } from "drizzle-orm";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getTableName } from "drizzle-orm";

// The scope values a row holds, one per scope column it holds a value for, each named by its table and column. A null
// Or undefined value names no row, so it is left out
export const getRowScopeValues = (table: Table, row: Record<string, unknown>): ScopeValue[] => {
  const tableName = getTableName(table);
  return getScopeKeys(table).flatMap((column) => {
    const value = row[column];
    return value === undefined || value === null ? [] : [{ column, table: tableName, value }];
  });
};
