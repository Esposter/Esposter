import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeTopic } from "@esposter/db-schema";
import type { SQLWrapper, Table } from "drizzle-orm";

import { getCascadeRowTopics } from "#src/services/realtime/getCascadeRowTopics";
import { getRowTopics } from "#src/services/realtime/getRowTopics";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { walkCascade } from "#src/services/realtime/walkCascade";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableColumnTopic, getTableTopic } from "@esposter/db-schema";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { SQLiteDeleteBase, SQLiteUpdateBase } from "drizzle-orm/sqlite-core";

// The topics a write's table publishes. An insert or a delete changes the table's rows, so it names the row topic. An update
// Changes no row's membership, only the columns it sets, and an update's `$onUpdate` columns, so it names those columns
const getTableTopics = (table: Table, statement: SQLWrapper): ScopeTopic[] => {
  const tableName = getTableName(table);
  if (!is(statement, SQLiteUpdateBase)) return [getTableTopic(tableName)];
  const columns = getTableColumns(table);
  const set = getStatementConfig(statement)?.set;
  const setKeys = checkIsRecord(set) ? Object.keys(set) : [];
  const updatedKeys = Object.keys(columns).filter((key) => columns[key]?.onUpdateFn !== undefined);
  return Array.from(new Set([...setKeys, ...updatedKeys]), (key) =>
    getTableColumnTopic(tableName, columns[key]?.name ?? key),
  );
};

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
  const tableTopics = getTableTopics(table, statement);
  const rowTopics = returnsRows ? await getRowTopics(table, rows) : [];
  const beforeTopics = (
    await Promise.all(before.map((recordedRows) => getRowTopics(recordedRows.table, recordedRows.rows)))
  ).flat();
  if (!is(statement, SQLiteDeleteBase)) return [...tableTopics, ...rowTopics, ...beforeTopics];
  const cascadedTopics = walkCascade(table).changedTables.map((cascadedTable) =>
    getTableTopic(getTableName(cascadedTable)),
  );
  // A set null or set default key changes its child's value in place, so the child's old value is named from the rows the
  // Delete returned, since the child was not read
  const cascadeRowTopics = returnsRows ? await getCascadeRowTopics(table, rows) : [];
  return [...tableTopics, ...rowTopics, ...cascadedTopics, ...cascadeRowTopics, ...beforeTopics];
};
