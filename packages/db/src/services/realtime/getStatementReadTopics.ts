import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { getJoinScopeValues } from "#src/services/realtime/getJoinScopeValues";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. A table a
// Statement level names by no equality of its own is named table-wide there, unless the statement joins it on a scope
// Column and returns the partner key: then each returned row names the value it joins on, so a row of another value does not
// Wake the read. A table the statement tests for null stays table-wide, since a write that clears the null brings back a row
// Whose value no returned row carries. A table left table-wide is one no returned row carries a join value for
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
  const nullTestedTables = new Set(readSet.nullChecks.map(({ table }) => table));
  const joinScopeValues = getJoinScopeValues(
    readSet.joins,
    rows,
    tableWideTables.filter((tableName) => !nullTestedTables.has(tableName)),
  );
  const joinedTables = new Set(joinScopeValues.map(({ table }) => table));
  const joinTopics = await getScopeTopics(joinScopeValues);
  const tableTopics = tableWideTables
    .filter((tableName) => !joinedTables.has(tableName))
    .map((tableName) => getTableTopic(tableName));
  return [...equalityTopics, ...tableTopics, ...joinTopics];
};
