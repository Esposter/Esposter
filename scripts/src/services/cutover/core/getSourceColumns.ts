import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";

import { tokenColumnsByTableName } from "#src/services/cutover/ids/credentialColumns";

// The columns a table is read from Postgres by. A bearer token is held as its hash in D1 but as the token itself in Postgres, so its column
// is read by the name Postgres has for it; every other column is read by its D1 name
export const getSourceColumns = (table: CoreTable): CoreColumn[] => {
  const tokenColumns = tokenColumnsByTableName.get(table.name) ?? [];
  return table.columns.map((column) => {
    const tokenColumn = tokenColumns.find(({ column: name }) => name === column.name);
    return tokenColumn ? { ...column, name: tokenColumn.oldColumn } : column;
  });
};
