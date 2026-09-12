import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ParseSortByToSql } from "@@/server/models/pagination/sorting/ParseSortByToSql";
import type { Column, SQL } from "drizzle-orm";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { asc, desc } from "drizzle-orm";

export const parseSortByToSql: ParseSortByToSql = <TColumns extends Record<string, Column>>(
  columns: TColumns,
  sortBy: SortItem<keyof TColumns & string>[],
): SQL[] =>
  // A key naming no column is dropped rather than ordered by: the schemas that produce sortBy only ever name
  // Real ones, and a deep link that outlived a rename must not fail the whole read
  sortBy.flatMap(({ key, order }) => {
    const column = columns[key];
    return column ? [order === SortOrder.Asc ? asc(column) : desc(column)] : [];
  });
