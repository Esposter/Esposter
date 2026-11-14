import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { getSourceColumns, getSourceKeyColumns } from "#src/services/cutover/core/getSourceColumns";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

// Every Postgres row of a core table in its key order, by the columns Postgres holds them under, for toCoreRecord to turn
// Into its D1 row. copy-core, its key sync and verify all read the source through this one walk
export const readSourceCoreRows = (source: SourceClient, table: CoreTable): AsyncGenerator<Record<string, unknown>> =>
  readKeysetRows({
    columns: getSourceColumns(table),
    dialect: SqlDialect.Postgres,
    keyColumns: getSourceKeyColumns(table),
    qualifiedTableName: `${quoteIdentifier(table.pgSchema)}.${quoteIdentifier(table.pgTable)}`,
    readPage: async ({ params, sql }) => source.unsafe<Record<string, unknown>[]>(sql, params),
  });
