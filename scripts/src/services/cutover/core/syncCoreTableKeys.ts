import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { D1Value } from "#src/services/cutover/core/toD1Value";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toCoreRecord } from "#src/services/cutover/core/toCoreRecord";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Reads one key value as D1 returns it: text or a number, with null for a key it does not hold
const readKeyValue = (column: CoreColumn, value: unknown): D1Value => {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value === null || value === undefined) return null;
  throw new InvalidOperationError(Operation.Read, column.name, "is a key that is neither text nor a number");
};

// Deletes the D1 rows the source no longer holds, compared by their new keys. Run after every table is upserted, and children first.
// A deleted parent cascades into its children, which by then are either deleted themselves or still hold a parent the source has
export const syncCoreTableKeys = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
  idMap: IdMap,
): Promise<number> => {
  const sourceKeys = new Set<string>();
  for await (const row of readKeysetRows({
    columns: table.columns,
    dialect: SqlDialect.Postgres,
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  })) {
    const record = toCoreRecord(table, row, idMap);
    sourceKeys.add(JSON.stringify(table.primaryKeyColumns.map(({ name }) => record[name])));
  }
  const staleStatements: D1Statement[] = [];
  for await (const row of readKeysetRows({
    columns: table.primaryKeyColumns,
    dialect: SqlDialect.Sqlite,
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: quoteIdentifier(table.name),
    readPage: (statement) => executor.query(statement),
  })) {
    const key = table.primaryKeyColumns.map((column) => readKeyValue(column, row[column.name]));
    if (sourceKeys.has(JSON.stringify(key))) continue;

    const condition = table.primaryKeyColumns.map(({ name }) => `${quoteIdentifier(name)} = ?`).join(" AND ");
    staleStatements.push({ params: key, sql: `DELETE FROM ${quoteIdentifier(table.name)} WHERE ${condition}` });
  }
  await writeStatements(executor, staleStatements);
  return staleStatements.length;
};
