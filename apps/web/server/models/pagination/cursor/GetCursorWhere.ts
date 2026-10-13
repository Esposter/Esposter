import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Column, SQL } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

export interface GetCursorWhere {
  // A table indexes its own columns directly, so a table and a columns record resolve a sort key the same way
  <TTable extends TableConfig>(
    table: PgTableWithColumns<TTable>,
    serializedCursors: string,
    sortBy: SortItem<keyof TTable["columns"] & string>[],
  ): SQL;
  // A selection rather than a table, for a sort key that is an expression computed in the query, such as a
  // Display name resolved from a join, which has no column of its own to compare a cursor against
  <TColumns extends Record<string, Column | SQL>>(
    columns: TColumns,
    serializedCursors: string,
    sortBy: SortItem<keyof TColumns & string>[],
  ): SQL;
}
