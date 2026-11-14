import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

type SourceClient = ReturnType<typeof createSourceClient>;

// Deletes the D1 rows the source no longer holds. Run after every table is upserted, and children first: a deleted parent
// cascades into its children, which by then are either deleted themselves or still hold a parent the source has
export const syncCoreTableKeys = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
): Promise<number> => {
  const sourceKeys = new Set<string>();
  for await (const row of readKeysetRows({
    columns: table.primaryKeyColumns,
    dialect: "postgres",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  }))
    sourceKeys.add(JSON.stringify(table.primaryKeyColumns.map((column) => toD1Value(column, row[column.name]))));
  const staleStatements: D1Statement[] = [];
  for await (const row of readKeysetRows({
    columns: table.primaryKeyColumns,
    dialect: "sqlite",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: quoteIdentifier(table.name),
    readPage: (statement) => executor.query(statement),
  })) {
    const key = table.primaryKeyColumns.map((column) => row[column.name] ?? null);
    if (sourceKeys.has(JSON.stringify(key))) continue;
    const condition = table.primaryKeyColumns.map(({ name }) => `${quoteIdentifier(name)} = ?`).join(" AND ");
    staleStatements.push({ params: key, sql: `DELETE FROM ${quoteIdentifier(table.name)} WHERE ${condition}` });
  }
  await writeStatements(executor, staleStatements);
  return staleStatements.length;
};
