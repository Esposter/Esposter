import type { ReadSet } from "#src/models/realtime/ReadSet";
import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { FilterSite } from "#src/models/realtime/FilterSite";
import { JoinKind } from "#src/models/realtime/JoinKind";
import { getJoinScopeValues } from "#src/services/realtime/getJoinScopeValues";
import { getOccurrenceKey } from "#src/services/realtime/getOccurrenceKey";
import { getScopeTopics } from "#src/services/realtime/getScopeTopics";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { getTableTopic } from "@esposter/db-schema";

// The table occurrences a left join may name by the rows it returns. An occurrence is named by no equality of its own, and is
// Neither tested by a filter nor referenced by an inner join's condition: an inner join drops the rows no match reaches, and a
// Filter removes rows
const getNamableOccurrences = (readSet: ReadSet): Set<string> => {
  const keys = readSet.occurrences.map((occurrence) => getOccurrenceKey(occurrence));
  const scopedKeys = new Set(
    readSet.occurrences.filter(({ scoped }) => scoped).map((occurrence) => getOccurrenceKey(occurrence)),
  );
  const blockedKeys = new Set([
    ...readSet.filters.filter(({ site }) => site !== FilterSite.LeftJoinOn).map((filter) => getOccurrenceKey(filter)),
    ...readSet.joins
      .filter(({ kind }) => kind === JoinKind.Inner)
      .flatMap(({ left, right }) => [getOccurrenceKey(left), getOccurrenceKey(right)]),
  ]);
  return new Set(keys.filter((key) => !scopedKeys.has(key) && !blockedKeys.has(key)));
};

// The topics one statement a read awaited watches. A scope equality names the rows it selects by its value. An unscoped table
// Occurrence is named by the rows a left join returns, when the join keeps its rows and returns the partner key: each returned
// Row names the value the join matches on, so a row of another value does not wake the read. An unscoped occurrence no returned
// Row names leaves its table table-wide, and a table-wide table's row topics are dropped, since its table-wide topic covers
// Every row. An empty read names what it named before, table-wide
export const getStatementReadTopics = async ({ rows, statement }: RecordedStatement): Promise<ScopeTopic[]> => {
  const readSet = getStatementReadSet(statement);
  const scopeValues: ScopeValue[] = readSet.scopes
    .filter(({ value }) => value !== undefined && value !== null)
    .map(({ column, table, value }) => ({ column, table, value }));
  const equalityTopics = await getScopeTopics(scopeValues);
  const occurrenceScopeValuesMap = getJoinScopeValues(readSet.joins, rows, getNamableOccurrences(readSet));
  const namedOccurrences = new Set(
    [...occurrenceScopeValuesMap].filter(([, values]) => values.length > 0).map(([key]) => key),
  );
  const tableWideTables = [
    ...new Set(
      readSet.occurrences
        .filter((occurrence) => !occurrence.scoped && !namedOccurrences.has(getOccurrenceKey(occurrence)))
        .map(({ table }) => table),
    ),
  ];
  const joinScopeValues = [...occurrenceScopeValuesMap.values()]
    .flat()
    .filter(({ table }) => !tableWideTables.includes(table));
  const joinTopics = await getScopeTopics(joinScopeValues);
  const tableTopics = tableWideTables.map((tableName) => getTableTopic(tableName));
  return [...equalityTopics, ...tableTopics, ...joinTopics];
};
