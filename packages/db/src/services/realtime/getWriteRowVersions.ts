import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { RowVersion } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { checkIsSecretColumn } from "#src/services/realtime/checkIsSecretColumn";
import { getRowScopeValues } from "#src/services/realtime/getRowScopeValues";
import { getScopeValue } from "#src/services/realtime/getScopeValue";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableName } from "drizzle-orm";

// One row a write returned, named by each scope column it holds a value for, the way its topic names it, and at the version
// The write left it. A row with no scope value names no row, and one with no version was not widened, so neither is named
const getRowVersion = async (table: Table, row: Record<string, unknown>): Promise<RowVersion | undefined> => {
  const tableName = getTableName(table);
  const { version } = row;
  const scopeValues = getRowScopeValues(table, row);
  if (typeof version !== "number" || scopeValues.length === 0) return undefined;
  const key = Object.fromEntries(
    await Promise.all(
      scopeValues.map(
        async ({ column, value }) =>
          [column, await getScopeValue(value, checkIsSecretColumn(tableName, column))] as const,
      ),
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
