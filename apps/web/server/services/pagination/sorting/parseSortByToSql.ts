import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Column, SQL } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { asc, desc } from "drizzle-orm";

interface ParseSortByToSql {
  // A table indexes its own columns directly (`users.id` is the column), so both a table and a bare column map
  // Resolve a sort key the same way
  <TTable extends TableConfig>(
    table: PgTableWithColumns<TTable>,
    sortBy: SortItem<keyof TTable["columns"] & string>[],
  ): SQL[];
  // A selection rather than a table, for a list whose sort keys span a join — the resource list sorts by the
  // Caller's own last-access time, which lives on another table but is selected alongside the resource columns
  <TColumns extends Record<string, Column>>(columns: TColumns, sortBy: SortItem<keyof TColumns & string>[]): SQL[];
}

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
