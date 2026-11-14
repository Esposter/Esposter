import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";

import {
  tableNameMessageNumberColumnsMap,
  tableNameUnsourcedColumnsMap,
} from "#src/services/cutover/core/columnSources";
import { tableNameTokenColumnsMap } from "#src/services/cutover/ids/credentialColumns";

// The Postgres column a D1 column is read from, or undefined for one Postgres never held. A bearer token's hash is read
// From the token, and a thread root's number from the root's row key, each by the name Postgres has for it; every other
// Column by its D1 name
const toSourceColumn = (table: CoreTable, column: CoreColumn): CoreColumn | undefined => {
  if (tableNameUnsourcedColumnsMap.get(table.name)?.includes(column.name)) return undefined;
  const renamed = [
    ...(tableNameTokenColumnsMap.get(table.name) ?? []),
    ...(tableNameMessageNumberColumnsMap.get(table.name) ?? []),
  ].find(({ column: name }) => name === column.name);
  return renamed ? { dataType: "string", name: renamed.oldColumn, notNull: column.notNull } : column;
};

// The columns a table is read from Postgres by
export const getSourceColumns = (table: CoreTable): CoreColumn[] =>
  table.columns.flatMap((column) => toSourceColumn(table, column) ?? []);

// The primary key a table is walked by in Postgres, in key order
export const getSourceKeyColumns = (table: CoreTable): CoreColumn[] =>
  table.primaryKeyColumns.flatMap((column) => toSourceColumn(table, column) ?? []);
