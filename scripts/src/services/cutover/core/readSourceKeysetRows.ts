import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

// Every row of a Postgres table in key order, by the columns and keys given, one keyset page at a time
export const readSourceKeysetRows = (
  source: SourceClient,
  table: CoreTable,
  columns: CoreColumn[],
  keyColumns: CoreColumn[],
): AsyncGenerator<Record<string, unknown>> =>
  readKeysetRows({
    columns,
    dialect: SqlDialect.Postgres,
    keyColumns,
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  });
