import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { getSourceColumns } from "#src/services/cutover/core/getSourceColumns";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { toCoreRecord } from "#src/services/cutover/core/toCoreRecord";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

type SourceClient = ReturnType<typeof createSourceClient>;

// Compares one table row by row, each row by its new key: the source's values through the copy's transform, the target's as stored,
// so a row that copied wrong names its key. The walk of the target is in its own key order, which the new keys sort by creation, so
// the source is matched by key rather than by position. Returns the rows the source held
export const verifyCoreTable = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
  idMap: IdMap,
): Promise<number> => {
  const targetCanonicalByKey = new Map<string, string>();
  for await (const row of readKeysetRows({
    columns: table.columns,
    dialect: "sqlite",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: quoteIdentifier(table.name),
    readPage: (statement) => executor.query(statement),
  }))
    targetCanonicalByKey.set(
      JSON.stringify(table.primaryKeyColumns.map((column) => row[column.name] ?? null)),
      JSON.stringify(table.columns.map((column) => row[column.name] ?? null)),
    );

  let sourceCount = 0;
  for await (const row of readKeysetRows({
    columns: getSourceColumns(table),
    dialect: "postgres",
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  })) {
    sourceCount += 1;
    const record = toCoreRecord(table, row, idMap);
    const key = JSON.stringify(table.primaryKeyColumns.map(({ name }) => record[name]));
    const canonical = JSON.stringify(table.columns.map(({ name }) => record[name]));
    const targetCanonical = targetCanonicalByKey.get(key);
    if (targetCanonical === undefined)
      throw new InvalidOperationError(Operation.Read, table.name, `row ${key} is missing from D1`);
    if (targetCanonical !== canonical)
      throw new InvalidOperationError(Operation.Read, table.name, `row ${key} differs from its source`);
    targetCanonicalByKey.delete(key);
  }

  const [extraKey] = targetCanonicalByKey.keys();
  if (extraKey !== undefined)
    throw new InvalidOperationError(Operation.Read, table.name, `row ${extraKey} is not in the source`);
  return sourceCount;
};
