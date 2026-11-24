import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { RowVersion } from "@esposter/db-schema";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { checkIsSecretColumn } from "#src/services/realtime/checkIsSecretColumn";
import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { listKeyFieldNames } from "@esposter/db-schema";
import { checkIsRecord } from "@esposter/shared";
import { getTableName } from "drizzle-orm";

// One row a write returned, named by its primary key's fields, the fields the overlay holds the row by, and at the
// Version the write left it. Each key value is named as the row holds it, a string or a number, so the header's key is
// The entry's key. A table no topic names is untracked, a row with a key value missing names no row, and one with no
// Version was not widened, so none of them is named. A key a credential is part of names no row either, since the
// Header never carries one
const getRowVersion = (table: SQLiteTable, row: Record<string, unknown>): RowVersion | undefined => {
  const tableName = getTableName(table);
  const { version } = row;
  const keyFieldNames = listKeyFieldNames(table);
  if (
    typeof version !== "number" ||
    getScopeKeys(table).length === 0 ||
    keyFieldNames.length === 0 ||
    keyFieldNames.some((fieldName) => checkIsSecretColumn(tableName, fieldName))
  )
    return undefined;

  const keyEntries = keyFieldNames.map((fieldName) => [fieldName, row[fieldName]] as const);
  if (
    !keyEntries.every(
      (entry): entry is readonly [string, number | string] =>
        typeof entry[1] === "string" || typeof entry[1] === "number",
    )
  )
    return undefined;
  const key = Object.fromEntries(keyEntries);
  return { key, table: tableName, version };
};

// The rows a request's writes changed, each at the version it now holds. A write names the rows it returned, so a
// Statement that is not a write, or that returned none, names none
export const getWriteRowVersions = (statements: RecordedStatement[]): RowVersion[] =>
  statements.flatMap(({ rows, statement }) => {
    const table = getWriteTable(statement);
    if (!table) return [];
    return rows.flatMap((row) => {
      if (!checkIsRecord(row)) return [];
      const rowVersion = getRowVersion(table, row);
      return rowVersion === undefined ? [] : [rowVersion];
    });
  });
