import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. Every table a
// Statement level names by no equality of its own is named table-wide there, so any change to its rows reaches the read,
// Whatever a nested statement selects of the same table. Naming a joined table by the rows it joins is a narrower topic
// The measurement may come to justify, but a row a WHERE clause removes from a join is not in the answer, and a change
// That restores it would not reach the read
export const getStatementReadTopics = async ({ statement }: RecordedStatement): Promise<ScopeTopic[]> => {
  const readSet = getStatementReadSet(statement);
  const scopeValues: ScopeValue[] = readSet.scopes
    .filter(({ value }) => value !== undefined && value !== null)
    .map(({ column, table, value }) => ({ column, table, value }));
  const equalityTopics = await getScopeTopics(scopeValues);
  const tableTopics = Array.from(
    new Set(
      readSet.levels.flatMap(({ scopedTables, tables }) => tables.filter((table) => !scopedTables.includes(table))),
    ),
    (tableName) => getTableTopic(tableName),
  );
  return [...equalityTopics, ...tableTopics];
};
