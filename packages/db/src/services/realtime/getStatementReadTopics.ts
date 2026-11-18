import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { FilterSite } from "#src/models/realtime/FilterSite";
import { getJoinScopeValues } from "#src/services/realtime/getJoinScopeValues";
import { getOccurrenceKey } from "#src/services/realtime/getOccurrenceKey";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. A table a
// Statement level names by no equality of its own is named table-wide there, unless the statement joins it on a scope
// Column through a join that keeps the partner's rows, and returns the partner key: then each returned row names the value
// It joins on, so a row of another value does not wake the read. A table occurrence a filter tests, beyond its joins, is not
// Named by its rows, since a write that makes a filtered row pass brings back a row no returned row carries; another
// Occurrence of the same table is still named by its rows. A table left table-wide is one no returned row carries a join
// Value for
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
  const filteredOccurrences = new Set(
    readSet.filters.filter(({ site }) => site !== FilterSite.LeftJoinOn).map((filter) => getOccurrenceKey(filter)),
  );
  const joinScopeValues = getJoinScopeValues(readSet.joins, rows, tableWideTables, filteredOccurrences);
  const joinedTables = new Set(joinScopeValues.map(({ table }) => table));
  const joinTopics = await getScopeTopics(joinScopeValues);
  const tableTopics = tableWideTables
    .filter((tableName) => !joinedTables.has(tableName))
    .map((tableName) => getTableTopic(tableName));
  return [...equalityTopics, ...tableTopics, ...joinTopics];
};
