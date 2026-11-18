import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableScope } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// The scope topic of each scope value each row holds: one per scope column a row has a value for. A null value names no
// Row, so it is left out
export const getRowTopics = (table: Table, rows: unknown[]): Promise<ScopeTopic[]> => {
  const tableName = getTableName(table);
  const scope = getTableScope(table);
  const columns = [...new Set([...(scope?.columns ?? []), ...(scope?.secretColumns ?? [])])];
  const scopeValues: ScopeValue[] = rows.flatMap((row) =>
    checkIsRecord(row)
      ? columns.flatMap((column) => {
          const value = row[column];
          return value === undefined || value === null ? [] : [{ column, table: tableName, value }];
        })
      : [],
  );
  return getScopeTopics(scopeValues);
};
