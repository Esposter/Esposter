import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import { SortOrder } from "@/models/shared/pagination/sorting/SortOrder";
import type { TableConfig } from "drizzle-orm";
import { asc, desc } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

export const convertSortByToSql = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(table[sb.key]) : desc(table[sb.key])));
