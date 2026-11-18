import type { ReadSetJoin, ReadSetKey } from "#src/models/realtime/ReadSet";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";

import { getScopeKeys } from "#src/services/realtime/getScopeKeys";
import { tableMap } from "#src/services/realtime/tableMap";
import { checkIsRecord } from "#src/util/object/checkIsRecord";

// The scope values one side of a join takes in the rows a read returned. The side must be a scope column of a table the
// Read names, and the other side's key must be one the read selects, so each row carries the value the join matches on
const getSideScopeValues = (side: ReadSetKey, partner: ReadSetKey, rows: unknown[]): ScopeValue[] => {
  const table = tableMap.get(side.table);
  const partnerKey = partner.selectedAs;
  if (partnerKey === undefined || !table || !getScopeKeys(table).includes(side.column)) return [];
  return rows.flatMap((row) => {
    if (!checkIsRecord(row)) return [];
    const value = row[partnerKey];
    return value === undefined || value === null ? [] : [{ column: side.column, table: side.table, value }];
  });
};

// The scope values the rows a read returned name for the tables it joins on a scope column. A side's value is the one its
// Partner key holds in each row, so a row of another value is not named. A table with no such value is named table-wide
export const getJoinScopeValues = (joins: ReadSetJoin[], rows: unknown[], tables: string[]): ScopeValue[] => {
  const namedTables = new Set(tables);
  return joins.flatMap(({ left, right }) => [
    ...(namedTables.has(left.table) ? getSideScopeValues(left, right, rows) : []),
    ...(namedTables.has(right.table) ? getSideScopeValues(right, left, rows) : []),
  ]);
};
