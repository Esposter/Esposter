import type { ColumnTopic } from "@esposter/db-schema";
import type { Table } from "drizzle-orm";

import { getRowScopeValues } from "#src/services/realtime/getRowScopeValues";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getColumnTopic } from "@esposter/db-schema";

// The scope topic of each scope value each row holds, one per scope column a row has a value for, each naming the columns
// The write changed (`undefined` for a row-set change). A null value names no row, so it is left out
export const getRowTopics = async (
  table: Table,
  rows: unknown[],
  columns: string[] | undefined,
): Promise<ColumnTopic[]> => {
  const scopeValues = rows.flatMap((row) => (checkIsRecord(row) ? getRowScopeValues(table, row) : []));
  return (await getScopeTopics(scopeValues)).map((topic) => getColumnTopic(topic, columns));
};
