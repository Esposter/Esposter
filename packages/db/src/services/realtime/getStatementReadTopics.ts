import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. Every other
// Table the statement reads is named table-wide, so any change to its rows reaches the read. Naming a joined table by the
// Rows it joins is a narrower topic the measurement may come to justify, but a row a WHERE clause removes from a join
// Is not in the answer, and a change that restores it would not reach the read
export const getStatementReadTopics = async ({ statement }: RecordedStatement): Promise<ScopeTopic[]> => {
  const readSet = getStatementReadSet(statement);
  const namedTableNames = new Set(readSet.scopes.map(({ table }) => table));
  const scopeValues: ScopeValue[] = readSet.scopes
    .filter(({ value }) => value !== undefined && value !== null)
    .map(({ column, table, value }) => ({ column, table, value }));
  const equalityTopics = await getScopeTopics(scopeValues);
  const tableTopics = [...new Set(readSet.tables)]
    .filter((tableName) => !namedTableNames.has(tableName))
    .map((tableName) => getTableTopic(tableName));
  return [...equalityTopics, ...tableTopics];
};
