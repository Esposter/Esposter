import type {
  ReadSet,
  ReadSetColumn,
  ReadSetFilter,
  ReadSetJoin,
  ReadSetKey,
  ReadSetScope,
} from "#src/models/realtime/ReadSet";
import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";

import { JoinSide } from "#src/models/realtime/JoinSide";
import { computeStatementReadSet } from "#src/services/realtime/computeStatementReadSet";

const toSideSerial = ({ column, level, occurrence, selectedAs, table }: ReadSetKey) =>
  `${level}:${occurrence}:${table}.${column}${selectedAs === undefined ? "" : `@${selectedAs}`}`;
const toColumnSerial = ({ column, table }: ReadSetColumn) => `${table}.${column}`;
const toFilterSerial = ({ column, level, occurrence, site, table }: ReadSetFilter) =>
  `${level}:${occurrence}:${toColumnSerial({ column, table })}@${site}`;
const toJoinSerial = ({ kind, left, nullFilled, right }: ReadSetJoin) =>
  `${kind}:${nullFilled ?? ""}:${toSideSerial(left)}|${toSideSerial(right)}`;
const toScopeSerial = ({ column, isSecret, table, value }: ReadSetScope) =>
  `${table}.${column}=${JSON.stringify(value)}${isSecret ? "#secret" : ""}`;

// A join is one fact whichever side a statement reads first, so its sides are ordered by their columns. A left join's
// Null-filled side moves with its column
const orderJoin = (join: ReadSetJoin): ReadSetJoin => {
  if (toColumnSerial(join.left) <= toColumnSerial(join.right)) return join;
  const flipped: ReadSetJoin = { kind: join.kind, left: join.right, right: join.left };
  if (join.nullFilled === undefined) return flipped;
  return { ...flipped, nullFilled: join.nullFilled === JoinSide.Left ? JoinSide.Right : JoinSide.Left };
};

// The facts of several statements, each once, in an order that does not depend on the order they were read in
const uniqueSorted = <T>(items: T[], toSerial: (item: T) => string): T[] => {
  const serialItemMap = new Map<string, T>();
  for (const item of items) serialItemMap.set(toSerial(item), item);
  return [...serialItemMap]
    .toSorted(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([, item]) => item);
};

// The read set of the statements a procedure awaited through its handle, merged into one set of facts
// Each statement numbers its levels from zero, so the merged read set moves a statement's level numbers past the levels the
// Statements before it opened. The -1 a subquery's selected column carries stays as it is
const shiftLevel = (level: number, offset: number): number => (level < 0 ? level : level + offset);

const getShiftedReadSet = (readSet: ReadSet, offset: number): ReadSet => ({
  ...readSet,
  filters: readSet.filters.map((filter) => ({ ...filter, level: shiftLevel(filter.level, offset) })),
  joins: readSet.joins.map((join) => ({
    ...join,
    left: { ...join.left, level: shiftLevel(join.left.level, offset) },
    right: { ...join.right, level: shiftLevel(join.right.level, offset) },
  })),
  occurrences: readSet.occurrences.map((occurrence) => ({
    ...occurrence,
    level: shiftLevel(occurrence.level, offset),
  })),
});

export const computeReadSet = (statements: RecordedStatement[]): ReadSet => {
  let offset = 0;
  const readSets = statements.map(({ statement }) => {
    const readSet = getShiftedReadSet(computeStatementReadSet(statement), offset);
    offset += readSet.levels.length;
    return readSet;
  });
  return {
    filters: uniqueSorted(
      readSets.flatMap((readSet) => readSet.filters),
      toFilterSerial,
    ),
    joins: uniqueSorted(
      readSets.flatMap((readSet) => readSet.joins).map((join) => orderJoin(join)),
      toJoinSerial,
    ),
    levels: readSets.flatMap((readSet) => readSet.levels),
    occurrences: readSets.flatMap((readSet) => readSet.occurrences),
    scopes: uniqueSorted(
      readSets.flatMap((readSet) => readSet.scopes),
      toScopeSerial,
    ),
    tables: uniqueSorted(
      readSets.flatMap((readSet) => readSet.tables),
      (table) => table,
    ),
  };
};
