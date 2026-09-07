import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BinaryOperator } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { exhaustiveGuard, InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { and, eq, gt, gte, lt, lte, or } from "drizzle-orm";

export const getCursorWhere = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => {
  const cursors = deserialize(serializedCursors);
  const getCursorValue = (key: string) => {
    const value = cursors[key];
    if (value === undefined) throw new NotFoundError(getCursorWhere.name, key);
    return value;
  };
  // Lexicographic tuple comparison — (k1 < v1) OR (k1 = v1 AND k2 < v2) OR … — so compound sorts
  // (e.g. a unique id tiebreaker after a non-unique key) paginate tied rows without skipping any
  const where = or(
    ...sortBy.map(({ isIncludeValue, key, order }, index) => {
      let operator: BinaryOperator;
      switch (order) {
        case SortOrder.Asc:
          operator = isIncludeValue ? gte : gt;
          break;
        case SortOrder.Desc:
          operator = isIncludeValue ? lte : lt;
          break;
        default:
          exhaustiveGuard(order);
      }
      return and(
        ...sortBy
          .slice(0, index)
          .map(({ key: previousKey }) => eq(takeOne(table, previousKey), getCursorValue(previousKey))),
        operator(takeOne(table, key), getCursorValue(key)),
      );
    }),
  );
  if (!where) throw new InvalidOperationError(Operation.Read, getCursorWhere.name, serializedCursors);
  return where;
};
