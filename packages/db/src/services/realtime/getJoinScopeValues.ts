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

// A join keeps the partner's rows whatever the named side holds, when the side is the one a left join null-fills.
// The partner's rows are in the read whether or not the named side has a row for their value.
// An `in` over the table itself keeps its subquery's rows too, since each value it names is held by an outer row
const checkIsPreservingJoin = (join: ReadSetJoin, side: JoinSide): boolean =>
  join.kind === JoinKind.Left
    ? join.nullFilled === side
    : join.kind === JoinKind.Subquery && join.left.table === join.right.table;

// The scope values the rows a read returned name for each table occurrence that a preserving join keeps.
// Only an occurrence in `namable` is named this way. A side's value is the one its partner key holds in each row.
// A row holding another value is not named by that side
export const getJoinScopeValues = (
  joins: ReadSetJoin[],
  rows: unknown[],
  namable: Set<string>,
): Map<string, ScopeValue[]> => {
  const occurrenceScopeValuesMap = new Map<string, ScopeValue[]>();
  for (const join of joins)
    for (const side of ["left", "right"] as const) {
      const named = side === "left" ? join.left : join.right;
      const partner = side === "left" ? join.right : join.left;
      const key = getOccurrenceKey(named);
      if (!checkIsPreservingJoin(join, side) || !namable.has(key)) continue;
      occurrenceScopeValuesMap.set(key, [
        ...(occurrenceScopeValuesMap.get(key) ?? []),
        ...getSideScopeValues(named, partner, rows),
      ]);
    }
  return occurrenceScopeValuesMap;
};
