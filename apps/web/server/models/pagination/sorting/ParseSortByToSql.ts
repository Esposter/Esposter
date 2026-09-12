import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Column, SQL } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

export interface ParseSortByToSql {
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
