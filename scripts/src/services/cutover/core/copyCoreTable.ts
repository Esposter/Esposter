import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { SourceClient } from "#src/models/cutover/SourceClient";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { KEYSET_PAGE_SIZE } from "#src/services/cutover/constants";
import { buildUpsertStatements } from "#src/services/cutover/core/buildUpsertStatements";
import { readSourceCoreRows } from "#src/services/cutover/core/readSourceCoreRows";
import { toCoreRecord } from "#src/services/cutover/core/toCoreRecord";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { toRowArray } from "#src/services/cutover/tables/toRowArray";

// Copies one Postgres table into its D1 table. Every row is read in key order and transformed by its column types.
// Its old ids are given their new ones, and the rows are upserted in batches. It returns how many rows the source held
export const copyCoreTable = async (
  source: SourceClient,
  executor: D1Executor,
  table: CoreTable,
  idMap: IdMap,
): Promise<number> => {
  let pending: D1Value[][] = [];
  let count = 0;
  const flush = async () => {
    await writeStatements(executor, buildUpsertStatements(table, pending));
    pending = [];
  };
  for await (const row of readSourceCoreRows(source, table)) {
    pending.push(toRowArray(table, toCoreRecord(table, row, idMap)));
    count += 1;
    if (pending.length >= KEYSET_PAGE_SIZE) await flush();
  }
  await flush();
  return count;
};
