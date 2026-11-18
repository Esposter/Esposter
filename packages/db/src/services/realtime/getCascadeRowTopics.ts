import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { tableNameReferencingKeysMap } from "#src/services/realtime/tableNameReferencingKeysMap";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableScope } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// The scope topic of each child row a delete of the given rows reaches directly. A cascading key removes the child rows
// That hold a deleted row's referenced value, and a key that sets the child's value to null or to its default changes
// Them, so each child row is named by the value it held. Only a child column that is a scope column is named this way,
// The rest of the child's rows are named by its table-wide topic
export const getCascadeRowTopics = (table: Table, rows: unknown[]): Promise<ScopeTopic[]> => {
  const scopeValues: ScopeValue[] = (tableNameReferencingKeysMap.get(getTableName(table)) ?? [])
    .filter(({ action }) => action === "cascade" || action === "set null" || action === "set default")
    .flatMap(({ columns, table: childTable }) => {
      const childTableName = getTableName(childTable);
      const scope = getTableScope(childTable);
      return columns
        .filter(
          ({ column }) => scope?.columns.includes(column) === true || scope?.secretColumns?.includes(column) === true,
        )
        .flatMap(({ column, parentColumn }) =>
          rows.flatMap((row) => {
            const value = checkIsRecord(row) ? row[parentColumn] : undefined;
            return value === undefined || value === null ? [] : [{ column, table: childTableName, value }];
          }),
        );
    });
  return getScopeTopics(scopeValues);
};
