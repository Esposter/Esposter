import type { ReadSet } from "#src/models/realtime/ReadSet";
import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ColumnTopic } from "@esposter/db-schema";

import { FilterSite } from "#src/models/realtime/FilterSite";
import { JoinKind } from "#src/models/realtime/JoinKind";
import { computeStatementReadSet } from "#src/services/realtime/computeStatementReadSet";
import { getJoinScopeValues } from "#src/services/realtime/getJoinScopeValues";
import { getOccurrenceKey } from "#src/services/realtime/getOccurrenceKey";
import { getReferencedColumns } from "#src/services/realtime/getReferencedColumns";
import { getScopeColumnTopics } from "#src/services/realtime/getScopeColumnTopics";
import { getColumnTopic, getTableTopic } from "@esposter/db-schema";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";

// The table occurrences a left join may name by the rows it returns. An occurrence is named by no equality of its own,
// And is Neither tested by a filter nor referenced by an inner join's condition: an inner join drops the rows no match
// Reaches, and a Filter removes rows
const getNamableOccurrences = (readSet: ReadSet): Set<string> => {
  const keys = readSet.occurrences.map((occurrence) => getOccurrenceKey(occurrence));
  const scopedKeys = new Set(
    readSet.occurrences.filter(({ isScoped }) => isScoped).map((occurrence) => getOccurrenceKey(occurrence)),
  );
  const blockedKeys = new Set([
    ...readSet.filters.filter(({ site }) => site !== FilterSite.LeftJoinOn).map((filter) => getOccurrenceKey(filter)),
    ...readSet.joins
      .filter(({ kind }) => kind === JoinKind.Inner)
      .flatMap(({ left, right }) => [getOccurrenceKey(left), getOccurrenceKey(right)]),
  ]);
  return new Set(keys.filter((key) => !scopedKeys.has(key) && !blockedKeys.has(key)));
};

// The topics one statement a read awaited watches, each with the columns the statement references of its table. A scope
// Equality names the rows it selects by its value. An unscoped table occurrence is named by the rows a left join
// Returns, when The join keeps its rows and returns the partner key: each returned row names the value the join matches
// On, so a row of Another value does not wake the read. An unscoped occurrence no returned row names leaves its table
// `table-wide`, and a Table-wide table's row topics are dropped, since its table-wide topic covers every row. An empty
// Read names what it named Before, table-wide
export const computeStatementReadTopics = async ({ rows, statement }: RecordedStatement): Promise<ColumnTopic[]> => {
  const readSet = computeStatementReadSet(statement);
  const { sql } = new SQLiteDialect().sqlToQuery(statement.getSQL());
  // A table's watch reads the columns its statement references, under the names and aliases the statement gives the
  // Table
  const tableColumnsMap = new Map<string, string[] | undefined>();
  const getColumns = (tableName: string) => {
    if (!tableColumnsMap.has(tableName)) {
      const aliases = readSet.occurrences
        .filter((occurrence) => occurrence.table === tableName)
        .map(({ occurrence }) => occurrence);
      tableColumnsMap.set(tableName, getReferencedColumns(sql, tableName, aliases));
    }
    return tableColumnsMap.get(tableName);
  };
  const scopeValues: ScopeValue[] = readSet.scopes
    .filter(({ value }) => value !== undefined && value !== null)
    .map(({ column, table, value }) => ({ column, table, value }));
  const equalityTopics = await getScopeColumnTopics(scopeValues, getColumns);
  const occurrenceScopeValuesMap = getJoinScopeValues(readSet.joins, rows, getNamableOccurrences(readSet));
  const namedOccurrences = new Set(
    [...occurrenceScopeValuesMap].filter(([, values]) => values.length > 0).map(([key]) => key),
  );
  const tableWideTables = [
    ...new Set(
      readSet.occurrences
        .filter((occurrence) => !occurrence.isScoped && !namedOccurrences.has(getOccurrenceKey(occurrence)))
        .map(({ table }) => table),
    ),
  ];
  const joinScopeValues = [...occurrenceScopeValuesMap.values()]
    .flat()
    .filter(({ table }) => !tableWideTables.includes(table));
  const joinTopics = await getScopeColumnTopics(joinScopeValues, getColumns);
  // A table-wide table names its rows, and the columns its statement reads, so an update of a column it does not read
  // Wakes it not
  const tableTopics = tableWideTables.map((tableName) =>
    getColumnTopic(getTableTopic(tableName), getColumns(tableName)),
  );
  return [...equalityTopics, ...tableTopics, ...joinTopics];
};
