import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import type { ItemMetadata } from "@/shared/models/itemMetadata";
import type { TableConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { SortOrder } from "@/models/shared/pagination/sorting/SortOrder";
import { parse } from "@/server/services/pagination/cursor/parse";
import { and, gt, lt } from "drizzle-orm";

export const getCursorWhere = <TTable extends TableConfig, TItem extends ItemMetadata>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = parse(serializedCursors);
  return and(
    ...Object.entries(cursors).map(([key, value]) => {
      const comparer = sortBy.some((s) => s.key === key && s.order === SortOrder.Asc) ? gt : lt;
      return comparer(table[key], value);
    }),
  );
};

export const getCursorWhereAzureTable = <TItem extends ItemMetadata>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = parse(serializedCursors);
  return Object.entries(cursors)
    .map(([key, value]) => {
      const comparer = sortBy.some((s) => s.key === key && s.order === SortOrder.Asc) ? "gt" : "lt";
      return `${key} ${comparer} '${value}'`;
    })
    .join(" and ");
};
