import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { TableConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { asc, desc } from "drizzle-orm";

export const parseSortByToSql = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(table[sb.key]) : desc(table[sb.key])));
