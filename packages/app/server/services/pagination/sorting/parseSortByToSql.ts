import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { asc, desc } from "drizzle-orm";
// @TODO: Check if we can make this use columns and update orderBy to also do the same
export const parseSortByToSql = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(table[sb.key]) : desc(table[sb.key])));
