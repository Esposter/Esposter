import type { JoinSide } from "#src/models/realtime/JoinSide";
import type { ReadSetJoin, ReadSetKey } from "#src/models/realtime/ReadSet";
import type { ScopeValue } from "#src/models/realtime/ScopeValue";

import { JoinKind } from "#src/models/realtime/JoinKind";
import { getOccurrenceKey } from "#src/services/realtime/getOccurrenceKey";
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

// A join keeps the partner's rows whatever the named side holds when the side is the one a left join null-fills, so the
// Partner's rows are in the read whether or not the named side has a row for their value. An `in` over the table itself
// Keeps the rows its subquery names too, since each of the subquery's values is held by a row of the outer read
const checkIsPreservingJoin = (join: ReadSetJoin, side: JoinSide): boolean =>
  join.kind === JoinKind.Left
    ? join.nullFilled === side
    : join.kind === JoinKind.Subquery && join.left.table === join.right.table;

// The scope values the rows a read returned name for the tables it joins on a scope column, through a join that keeps the
// Partner's rows. A side's value is the one its partner key holds in each row, so a row of another value is not named.
// A table occurrence is named this way only when it is table-wide in the read and no filter tests that occurrence. A
// Filter on another occurrence of the same table removes none of this occurrence's rows, so it does not stop the naming
export const getJoinScopeValues = (
  joins: ReadSetJoin[],
  rows: unknown[],
  tables: string[],
  filteredOccurrences: Set<string>,
): ScopeValue[] => {
  const namedTables = new Set(tables);
  const isNamable = (side: ReadSetKey) =>
    namedTables.has(side.table) && !filteredOccurrences.has(getOccurrenceKey(side));
  return joins.flatMap((join) => [
    ...(checkIsPreservingJoin(join, "left") && isNamable(join.left)
      ? getSideScopeValues(join.left, join.right, rows)
      : []),
    ...(checkIsPreservingJoin(join, "right") && isNamable(join.right)
      ? getSideScopeValues(join.right, join.left, rows)
      : []),
  ]);
};
