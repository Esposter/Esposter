import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeTopic } from "@esposter/db-schema";

import { getCascadeRowTopics } from "#src/services/realtime/getCascadeRowTopics";
import { getRowTopics } from "#src/services/realtime/getRowTopics";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { walkCascade } from "#src/services/realtime/walkCascade";
import { getTableTopic } from "@esposter/db-schema";
import { getTableName, is } from "drizzle-orm";
import { SQLiteDeleteBase } from "drizzle-orm/sqlite-core";

// The topics one statement publishes. A write that asks for RETURNING names the scope values of the rows it returned, so
// One that returned none changed nothing. A write that asks for none names the rows it read before it ran, if it made
// Any: an update's old values, and a delete's cascaded rows. Every changed table names its table-wide topic, and a delete's
// Cascaded tables are named table-wide, since RETURNING does not report the rows they lose
export const getStatementWriteTopics = async ({
  before,
  rows,
  statement,
}: RecordedStatement): Promise<ScopeTopic[]> => {
  const table = getWriteTable(statement);
  if (!table) return [];
  const returnsRows = getStatementConfig(statement)?.returning !== undefined;
  if (returnsRows && rows.length === 0) return [];
  const tableTopic = getTableTopic(getTableName(table));
  const rowTopics = returnsRows ? await getRowTopics(table, rows) : [];
  const beforeTopics = (
    await Promise.all(before.map((recordedRows) => getRowTopics(recordedRows.table, recordedRows.rows)))
  ).flat();
  if (!is(statement, SQLiteDeleteBase)) return [tableTopic, ...rowTopics, ...beforeTopics];
  const cascadedTopics = walkCascade(table).changedTables.map((cascadedTable) =>
    getTableTopic(getTableName(cascadedTable)),
  );
  // A set null or set default key changes its child's value in place, so the child's old value is named from the rows the
  // Delete returned, since the child was not read
  const cascadeRowTopics = returnsRows ? await getCascadeRowTopics(table, rows) : [];
  return [tableTopic, ...rowTopics, ...cascadedTopics, ...cascadeRowTopics, ...beforeTopics];
};
