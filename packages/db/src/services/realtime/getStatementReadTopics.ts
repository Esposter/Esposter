import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { getJoinScopeValues } from "#src/services/realtime/getJoinScopeValues";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. A table a
// Statement level names by no equality of its own is named table-wide there, unless the statement joins it on a scope
// Column through a join that keeps the partner's rows, and returns the partner key: then each returned row names the value
// It joins on, so a row of another value does not wake the read. A table the statement filters beyond its joins stays
// Table-wide, since a write that makes a filtered row pass brings back a row no returned row carries. A table left
// Table-wide is one no returned row carries a join value for
export const getStatementReadTopics = async ({ rows, statement }: RecordedStatement): Promise<ScopeTopic[]> => {
  const readSet = getStatementReadSet(statement);
  const scopeValues: ScopeValue[] = readSet.scopes
    .filter(({ value }) => value !== undefined && value !== null)
    .map(({ column, table, value }) => ({ column, table, value }));
  const equalityTopics = await getScopeTopics(scopeValues);
  const tableWideTables = [
    ...new Set(
      readSet.levels.flatMap(({ scopedTables, tables }) => tables.filter((table) => !scopedTables.includes(table))),
    ),
  ];
  const filteredTables = new Set(readSet.filters.map(({ table }) => table));
  const joinScopeValues = getJoinScopeValues(
    readSet.joins,
    rows,
    tableWideTables.filter((tableName) => !filteredTables.has(tableName)),
  );
  const joinedTables = new Set(joinScopeValues.map(({ table }) => table));
  const joinTopics = await getScopeTopics(joinScopeValues);
  const tableTopics = tableWideTables
    .filter((tableName) => !joinedTables.has(tableName))
    .map((tableName) => getTableTopic(tableName));
  return [...equalityTopics, ...tableTopics, ...joinTopics];
};
