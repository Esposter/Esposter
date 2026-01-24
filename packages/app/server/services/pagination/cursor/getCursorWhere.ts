import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BinaryOperator } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { exhaustiveGuard, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { and, gt, gte, lt, lte } from "drizzle-orm";

export const getCursorWhere = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => {
  const cursors = deserialize(serializedCursors);
  const sql = and(
    ...Object.entries(cursors).map(([key, value]) => {
      const sortItem = sortBy.find((s) => s.key === key);
      if (!sortItem) throw new NotFoundError(getCursorWhere.name, key);

      let operator: BinaryOperator;
      switch (sortItem.order) {
        case SortOrder.Asc:
          operator = sortItem.isIncludeValue ? gte : gt;
          break;
        case SortOrder.Desc:
          operator = sortItem.isIncludeValue ? lte : lt;
          break;
        default:
          exhaustiveGuard(sortItem.order);
      }
      return operator(table[key], value);
    }),
  );
  if (!sql) throw new InvalidOperationError(Operation.Read, getCursorWhere.name, serializedCursors);
  return sql;
};
