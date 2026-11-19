import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ColumnTopic } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { getScopeValueTopic } from "#src/services/realtime/getScopeTopics";
import { tableNameReferencingKeysMap } from "#src/services/realtime/tableNameReferencingKeysMap";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getColumnTopic, getTableScope } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// The scope topic of each child row a delete of the given rows changes in place: a key that sets the child's value to null
// Or to its default. Only a child column that is a scope column is named, by the value the deleted row held, and the change
// Names that column alone. A cascading key removes its child rows, which the delete's before-image reads name, so it is not
// Repeated here
export const getCascadeRowTopics = (table: Table, rows: unknown[]): Promise<ColumnTopic[]> => {
  const scopeValues: { columns: string[]; scopeValue: ScopeValue }[] = (
    tableNameReferencingKeysMap.get(getTableName(table)) ?? []
  )
    .filter(({ action }) => action === "set null" || action === "set default")
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
            return value === undefined || value === null
              ? []
              : [{ columns: [column], scopeValue: { column, table: childTableName, value } }];
          }),
        );
    });
  return Promise.all(
    scopeValues.map(async ({ columns, scopeValue }) => getColumnTopic(await getScopeValueTopic(scopeValue), columns)),
  );
};
