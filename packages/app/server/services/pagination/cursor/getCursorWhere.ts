import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { BinaryOperator, TableConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { parse } from "#shared/services/pagination/cursor/parse";
import { exhaustiveGuard, NotFoundError } from "@esposter/shared";
import { and, gt, gte, lt, lte } from "drizzle-orm";

export const getCursorWhere = <TTable extends TableConfig, TItem extends ToData<AEntity>>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = parse(serializedCursors);
  return and(
    ...Object.entries(cursors).map(([key, value]) => {
      const sortItem = sortBy.find((s) => s.key === key);
      if (!sortItem) throw new NotFoundError(getCursorWhere.name, key);

      let comparer: BinaryOperator;
      switch (sortItem.order) {
        case SortOrder.Asc:
          comparer = sortItem.isIncludeValue ? gte : gt;
          break;
        case SortOrder.Desc:
          comparer = sortItem.isIncludeValue ? lte : lt;
          break;
        default:
          exhaustiveGuard(sortItem.order);
      }
      return comparer(table[key], value);
    }),
  );
};
