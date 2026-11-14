import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { KeyedCanonicalRow } from "#src/models/cutover/KeyedCanonicalRow";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { findFirstDifference } from "#src/services/cutover/verify/findFirstDifference";

type SourceClient = ReturnType<typeof createSourceClient>;

// Compares one table row by row in key order, each side's value run through the one transform: the source's by the
// copy's transform, the target's as stored, so a row that copied wrong names its key. Returns the rows the source held
export const verifyCoreTable = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
): Promise<number> => {
  let sourceCount = 0;
  const sourceRows = (async function* (): AsyncGenerator<KeyedCanonicalRow, void> {
    for await (const row of readKeysetRows({
      columns: table.columns,
      dialect: "postgres",
      keyColumns: table.primaryKeyColumns,
      qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
      readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
    })) {
      sourceCount += 1;
      yield {
        canonical: JSON.stringify(table.columns.map((column) => toD1Value(column, row[column.name]))),
        key: table.primaryKeyColumns.map((column) => toD1Value(column, row[column.name])),
      };
    }
  })();
  const targetRows = (async function* (): AsyncGenerator<KeyedCanonicalRow, void> {
    for await (const row of readKeysetRows({
      columns: table.columns,
      dialect: "sqlite",
      keyColumns: table.primaryKeyColumns,
      qualifiedTableName: quoteIdentifier(table.name),
      readPage: (statement) => executor.query(statement),
    }))
      yield {
        canonical: JSON.stringify(table.columns.map((column) => row[column.name] ?? null)),
        key: table.primaryKeyColumns.map((column) => row[column.name] ?? null),
      };
  })();
  const difference = await findFirstDifference(sourceRows, targetRows);
  if (difference)
    throw new InvalidOperationError(
      Operation.Read,
      table.name,
      `row ${JSON.stringify(difference.key)} is ${difference.reason}`,
    );
  return sourceCount;
};
