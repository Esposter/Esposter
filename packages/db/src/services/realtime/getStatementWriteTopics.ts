import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ColumnTopic } from "@esposter/db-schema";
import type { SQLWrapper, Table } from "drizzle-orm";

import { getRowTopics } from "#src/services/realtime/getRowTopics";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { getWriteTable } from "#src/services/realtime/getWriteTable";
import { walkCascade } from "#src/services/realtime/walkCascade";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getColumnTopic, getTableTopic } from "@esposter/db-schema";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { SQLiteDeleteBase, SQLiteUpdateBase } from "drizzle-orm/sqlite-core";

// The columns a write changes. An update changes the columns it sets and its `$onUpdate` columns, and an insert or a delete
// Changes which rows the table holds, a row-set change, so it names no columns (`undefined`)
const getWriteColumns = (table: Table, statement: SQLWrapper): string[] | undefined => {
  if (!is(statement, SQLiteUpdateBase)) return undefined;
  const columns = getTableColumns(table);
  const set = getStatementConfig(statement)?.set;
  const setKeys = checkIsRecord(set) ? Object.keys(set) : [];
  const updatedKeys = Object.keys(columns).filter((key) => columns[key]?.onUpdateFn !== undefined);
  return [...new Set([...setKeys, ...updatedKeys].map((key) => columns[key]?.name ?? key))];
};

// The topics one statement publishes, each with the columns the write changed. A write that asks for RETURNING names the
// Scope values of the rows it returned, so one that returned none changed nothing. A write that asks for none names the rows
// It read before it ran, if it made any: an update's old values, and a delete's cascaded and changed rows. Every changed table
// Names its table-wide topic, and a delete's cascaded and changed tables are named table-wide, since RETURNING does not report them
export const getStatementWriteTopics = async ({
  before,
  rows,
  statement,
}: RecordedStatement): Promise<ColumnTopic[]> => {
  const table = getWriteTable(statement);
  if (!table) return [];
  const returnsRows = getStatementConfig(statement)?.returning !== undefined;
  if (returnsRows && rows.length === 0) return [];
  const columns = getWriteColumns(table, statement);
  const tableTopics = [getColumnTopic(getTableTopic(getTableName(table)), columns)];
  const rowTopics = await getRowTopics(table, rows, columns);
  const beforeTopics = (
    await Promise.all(before.map((recordedRows) => getRowTopics(recordedRows.table, recordedRows.rows, columns)))
  ).flat();
  if (!is(statement, SQLiteDeleteBase)) return [...tableTopics, ...rowTopics, ...beforeTopics];
  const cascadedTopics = walkCascade(table).changedTables.map((cascadedTable) =>
    getColumnTopic(getTableTopic(getTableName(cascadedTable)), undefined),
  );
  return [...tableTopics, ...rowTopics, ...cascadedTopics, ...beforeTopics];
};
