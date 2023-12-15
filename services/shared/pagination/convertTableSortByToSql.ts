import { type SortItem } from "@/models/shared/pagination/SortItem";
import { SortOrder } from "@/models/shared/pagination/SortOrder";
import { asc, desc, type TableConfig } from "drizzle-orm";
import { type PgTableWithColumns } from "drizzle-orm/pg-core";

export const convertTableSortByToSql = <TTable extends TableConfig>(
  table: PgTableWithColumns<TTable>,
  sortBy: SortItem<keyof TTable["columns"] & string>[],
) => sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(table[sb.key]) : desc(table[sb.key])));
