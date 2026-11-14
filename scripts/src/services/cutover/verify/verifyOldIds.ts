import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";

import { SqlDialect } from "#src/models/cutover/SqlDialect";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { readKeysetRows } from "#src/services/cutover/core/readKeysetRows";
import { quoteIdentifier } from "#src/services/cutover/postgres/quoteIdentifier";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks that no old UUID is left in D1: every text value of every core table, a key, a foreign key or a value inside JSON, is tested
// A UUID the map names is exactly what the copy's replace would have rewritten, so finding one is a miss.
export const verifyOldIds = async (executor: D1Executor, idMap: IdMap): Promise<void> => {
  for (const table of getCoreTables())
    for await (const row of readKeysetRows({
      columns: table.columns,
      dialect: SqlDialect.Sqlite,
      keyColumns: table.primaryKeyColumns,
      qualifiedTableName: quoteIdentifier(table.name),
      readPage: (statement) => executor.query(statement),
    }))
      for (const { name } of table.columns) {
        const value = row[name];
        if (typeof value === "string" && idMap.rewrite(value) !== value)
          throw new InvalidOperationError(Operation.Read, table.name, `holds an old id in ${name}`);
      }
};
