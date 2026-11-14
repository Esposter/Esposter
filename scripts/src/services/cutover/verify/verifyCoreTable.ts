import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { readSourceCoreRows } from "#src/services/cutover/core/readSourceCoreRows";
import { toCoreRecord } from "#src/services/cutover/core/toCoreRecord";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Compares one table row by row, each row by its new key: the source's values through the copy's transform, the target's as stored.
// So a row that copied wrong names its key.
// The walk of the target is in its own key order, which the new keys sort by creation, so the source is matched by key rather than by position.
// Returns the rows the source held
export const verifyCoreTable = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
  idMap: IdMap,
): Promise<number> => {
  const keyTargetCanonicalMap = new Map<string, string>();
  for await (const row of readKeysetRows({
    columns: table.columns,
    dialect: SqlDialect.Sqlite,
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: quoteIdentifier(table.name),
    readPage: (statement) => executor.query(statement),
  }))
    keyTargetCanonicalMap.set(
      JSON.stringify(table.primaryKeyColumns.map((column) => row[column.name] ?? null)),
      JSON.stringify(table.columns.map((column) => row[column.name] ?? null)),
    );

  let sourceCount = 0;
  for await (const row of readSourceCoreRows(source, table)) {
    sourceCount += 1;
    const record = toCoreRecord(table, row, idMap);
    const key = JSON.stringify(table.primaryKeyColumns.map(({ name }) => record[name]));
    const canonical = JSON.stringify(table.columns.map(({ name }) => record[name]));
    const targetCanonical = keyTargetCanonicalMap.get(key);
    if (targetCanonical === undefined)
      throw new InvalidOperationError(Operation.Read, table.name, `row ${key} is missing from D1`);
    if (targetCanonical !== canonical)
      throw new InvalidOperationError(Operation.Read, table.name, `row ${key} differs from its source`);
    keyTargetCanonicalMap.delete(key);
  }

  const [extraKey] = keyTargetCanonicalMap.keys();
  if (extraKey !== undefined)
    throw new InvalidOperationError(Operation.Read, table.name, `row ${extraKey} is not in the source`);
  return sourceCount;
};
