import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { readTargetCoreRows } from "#src/services/cutover/core/readTargetCoreRows";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks that no old UUID is left in D1: every text value of every core table, a key, a foreign key or a value inside JSON, is tested
// A UUID the map names is exactly what the copy's replace would have rewritten, so finding one is a miss.
export const verifyOldIds = async (executor: D1Executor, idMap: IdMap): Promise<void> => {
  for (const table of getCoreTables())
    for await (const row of readTargetCoreRows(executor, table))
      for (const { name } of table.columns) {
        const value = row[name];
        if (typeof value === "string" && idMap.rewrite(value) !== value)
          throw new InvalidOperationError(Operation.Read, table.name, `holds an old id in ${name}`);
      }
};
