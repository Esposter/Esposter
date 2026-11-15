import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { getSourceColumns, getSourceKeyColumns } from "#src/services/cutover/core/getSourceColumns";
import { readSourceKeysetRows } from "#src/services/cutover/core/readSourceKeysetRows";

// Every Postgres row of a core table in its key order, by the columns Postgres holds them under, for toCoreRecord to turn
// Into its D1 row. copy-core, its key sync and verify all read the source through this one walk
export const readSourceCoreRows = (source: SourceClient, table: CoreTable): AsyncGenerator<Record<string, unknown>> =>
  readSourceKeysetRows(source, table, getSourceColumns(table), getSourceKeyColumns(table));
