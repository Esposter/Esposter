import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ColumnTopic } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getColumnTopic } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// The scope topic of each scope value each row holds, one per scope column a row has a value for, each naming the columns
// The write changed (`undefined` for a row-set change). A null value names no row, so it is left out
export const getRowTopics = async (
  table: Table,
  rows: unknown[],
  columns: string[] | undefined,
): Promise<ColumnTopic[]> => {
  const tableName = getTableName(table);
  const scopeKeys = getScopeKeys(table);
  const scopeValues: ScopeValue[] = rows.flatMap((row) =>
    checkIsRecord(row)
      ? scopeKeys.flatMap((column) => {
          const value = row[column];
          return value === undefined || value === null ? [] : [{ column, table: tableName, value }];
        })
      : [],
  );
  return (await getScopeTopics(scopeValues)).map((topic) => getColumnTopic(topic, columns));
};
