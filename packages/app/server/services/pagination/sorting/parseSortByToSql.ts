import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { TableRelationalConfig } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { asc, desc, SQL } from "drizzle-orm";

export function parseSortByToSql<TTable extends TableRelationalConfig["columns"]>(
  table: TTable,
  sortBy: SortItem<keyof TTable & string>[],
): SQL[];
export function parseSortByToSql<TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
): SQL[];
export function parseSortByToSql<TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
): SQL[] {
  return sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(table[sb.key]) : desc(table[sb.key])));
}
