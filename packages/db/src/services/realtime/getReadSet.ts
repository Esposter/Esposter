import type { ReadSet, ReadSetColumn, ReadSetJoin, ReadSetKey, ReadSetScope } from "#src/models/realtime/ReadSet";
import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";

import { JoinSide } from "#src/models/realtime/JoinSide";
import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";

const toSideSerial = ({ column, selectedAs, table }: ReadSetKey) =>
  `${table}.${column}${selectedAs === undefined ? "" : `@${selectedAs}`}`;
const toColumnSerial = ({ column, table }: ReadSetColumn) => `${table}.${column}`;
const toJoinSerial = ({ kind, left, nullFilled, right }: ReadSetJoin) =>
  `${kind}:${nullFilled ?? ""}:${toSideSerial(left)}|${toSideSerial(right)}`;
const toScopeSerial = ({ column, secret, table, value }: ReadSetScope) =>
  `${table}.${column}=${JSON.stringify(value)}${secret ? "#secret" : ""}`;

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
export const getReadSet = (statements: RecordedStatement[]): ReadSet => {
  const readSets = statements.map(({ statement }) => getStatementReadSet(statement));
  return {
    filters: uniqueSorted(
      readSets.flatMap((readSet) => readSet.filters),
      toColumnSerial,
    ),
    joins: uniqueSorted(
      readSets.flatMap((readSet) => readSet.joins).map((join) => orderJoin(join)),
      toJoinSerial,
    ),
    levels: readSets.flatMap((readSet) => readSet.levels),
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
