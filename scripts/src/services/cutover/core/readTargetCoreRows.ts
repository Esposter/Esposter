import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { D1Executor } from "#src/models/cutover/D1Executor";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";

// Every row of a core table as D1 holds it, in key order, one keyset page at a time
export const readTargetCoreRows = (executor: D1Executor, table: CoreTable): AsyncGenerator<Record<string, unknown>> =>
  readKeysetRows({
    columns: table.columns,
    dialect: SqlDialect.Sqlite,
    keyColumns: table.primaryKeyColumns,
    qualifiedTableName: quoteIdentifier(table.name),
    readPage: (statement) => executor.query(statement),
  });
