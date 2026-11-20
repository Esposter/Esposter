import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { RowVersion } from "@esposter/db-schema";

import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { listKeyFieldNames } from "#src/services/shared/overlay/listKeyFieldNames";

// The rows of one table a write's answer named, as the confirmations its entry waits for. The header names a row by its
// Scope values, which for a table keyed by its own columns are its key fields, so the key is read by the fields the
// Table's primary key declares and no store restates them. A row of another table, or one whose header leaves a key
// Field out, confirms none
export const createHeaderConfirmations = <TRow extends Versioned>(
  table: Table<TRow>,
  rowVersions: RowVersion[],
): Confirmation[] => {
  const keyFieldNames = listKeyFieldNames(table.source);
  return rowVersions.flatMap(({ key, table: tableName, version }) => {
    if (tableName !== table.name) return [];

    const rowKey = keyFieldNames.map((fieldName) => key[fieldName]);
    return rowKey.every((value): value is string => value !== undefined)
      ? [createConfirmation(table, rowKey, version)]
      : [];
  });
};
