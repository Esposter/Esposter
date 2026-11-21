import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { RowVersion } from "@esposter/db-schema";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { checkIsSecretColumn } from "#src/services/realtime/checkIsSecretColumn";
import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getScopeValue } from "#src/services/realtime/getScopeValue";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { listKeyFieldNames } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// One row a write returned, named by its primary key's fields, the fields the overlay holds the row by, and at the version the
// Write left it. A table no topic names is untracked, a row with a key value missing names no row, and one with no version was
// Not widened, so none of them is named. A key a credential is part of names no row either, since the header never carries one
const getRowVersion = async (table: SQLiteTable, row: Record<string, unknown>): Promise<RowVersion | undefined> => {
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

  const keyValues = keyFieldNames.map((fieldName) => row[fieldName]);
  if (keyValues.some((value) => value === undefined || value === null)) return undefined;
  const key = Object.fromEntries(
    await Promise.all(
      keyFieldNames.map(async (fieldName, index) => [fieldName, await getScopeValue(keyValues[index], false)] as const),
    ),
  );
  return { key, table: tableName, version };
};

// The rows a request's writes changed, each at the version it now holds. A write names the rows it returned, so a statement
// That is not a write, or that returned none, names none
export const getWriteRowVersions = async (statements: RecordedStatement[]): Promise<RowVersion[]> => {
  const rowVersions = await Promise.all(
    statements.flatMap(({ rows, statement }) => {
      const table = getWriteTable(statement);
      return table ? rows.filter((row) => checkIsRecord(row)).map((row) => getRowVersion(table, row)) : [];
    }),
  );
  return rowVersions.filter((rowVersion): rowVersion is RowVersion => rowVersion !== undefined);
};
