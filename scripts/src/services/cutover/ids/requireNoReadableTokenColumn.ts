import type { CoreTable } from "#src/models/cutover/CoreTable";

import { tableNameTokenColumnsMap } from "#src/services/cutover/ids/credentialColumns";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A bearer token is stored as its hash only.
// A D1 table that still keeps the column the copy reads its readable token from would be written the token itself.
// The copy therefore refuses that table rather than write one credential in the clear
export const requireNoReadableTokenColumn = (table: CoreTable): void => {
  const readableTokenColumn = (tableNameTokenColumnsMap.get(table.name) ?? []).find(
    ({ column, oldColumn }) => column !== oldColumn && table.columns.some(({ name }) => name === oldColumn),
  );
  if (readableTokenColumn)
    throw new InvalidOperationError(
      Operation.Read,
      table.name,
      `keeps the readable ${readableTokenColumn.oldColumn} column, which the copy must not write`,
    );
};
