import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeTopic } from "@esposter/db-schema";

import { getCascadedTables } from "#src/services/realtime/getCascadedTables";
import { getCascadeRowTopics } from "#src/services/realtime/getCascadeRowTopics";
import { getRowTopics } from "#src/services/realtime/getRowTopics";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { getTableTopic } from "@esposter/db-schema";
import { getTableName, is } from "drizzle-orm";
import { SQLiteDeleteBase } from "drizzle-orm/sqlite-core";

// The topics one statement publishes. A write that asks for RETURNING names the scope values of the rows it returned,
// So one that returned none changed nothing. A write that asks for none reports nothing about its rows, so it names its
// Table alone. Every changed table names its table-wide topic. A delete also changes the child rows its keys cascade to,
// Which RETURNING does not report: each child table is named table-wide, and the children a deleted row's value holds
// Are named by that value where the child's column is a scope column
export const getStatementWriteTopics = async ({ rows, statement }: RecordedStatement): Promise<ScopeTopic[]> => {
  const table = getWriteTable(statement);
  if (!table) return [];
  const returnsRows = getStatementConfig(statement)?.returning !== undefined;
  if (returnsRows && rows.length === 0) return [];
  const rowTopics = returnsRows ? await getRowTopics(table, rows) : [];
  if (!is(statement, SQLiteDeleteBase)) return [getTableTopic(getTableName(table)), ...rowTopics];
  const cascadedTopics = getCascadedTables(table).map((cascadedTable) => getTableTopic(getTableName(cascadedTable)));
  const cascadeRowTopics = returnsRows ? await getCascadeRowTopics(table, rows) : [];
  return [getTableTopic(getTableName(table)), ...rowTopics, ...cascadedTopics, ...cascadeRowTopics];
};
