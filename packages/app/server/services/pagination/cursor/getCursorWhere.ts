import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BinaryOperator, SQL, TableConfig, TableRelationalConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { exhaustiveGuard, NotFoundError } from "@esposter/shared";
import { and, gt, gte, lt, lte } from "drizzle-orm";

interface GetCursorWhere {
  <TTable extends TableRelationalConfig["columns"]>(
    table: TTable,
    serializedCursors: string,
    sortBy: SortItem<keyof TTable & string>[],
  ): SQL | undefined;
  <TTable extends TableConfig>(
    table: PgTableWithColumns<TTable>,
    serializedCursors: string,
    sortBy: SortItem<keyof TTable["columns"] & string>[],
  ): SQL | undefined;
}

export const getCursorWhere: GetCursorWhere = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => {
  const cursors = deserialize(serializedCursors);
  return and(
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
};
