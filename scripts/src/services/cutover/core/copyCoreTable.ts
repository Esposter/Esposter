import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { KEYSET_PAGE_SIZE } from "#src/services/cutover/constants";
import { buildUpsertStatements } from "#src/services/cutover/core/buildUpsertStatements";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

type SourceClient = ReturnType<typeof createSourceClient>;

// Copies one Postgres table into its D1 table: every row read in key order, transformed by its column types, and upserted
// in batches. Returns how many rows the source held
export const copyCoreTable = async (source: SourceClient, executor: D1Executor, table: CoreTable): Promise<number> => {
  const qualifiedSourceName = `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`;
  let pending: D1Value[][] = [];
  let count = 0;
  const flush = async () => {
    await writeStatements(executor, buildUpsertStatements(table, pending));
    pending = [];
  };
  for await (const row of readKeysetRows({
    columns: table.columns,
    dialect: "postgres",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: qualifiedSourceName,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  })) {
    pending.push(table.columns.map((column: CoreColumn) => toD1Value(column, row[column.name])));
    count += 1;
    if (pending.length >= KEYSET_PAGE_SIZE) await flush();
  }
  await flush();
  return count;
};
