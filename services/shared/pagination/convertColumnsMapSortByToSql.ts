import type { SortItem } from "@/models/shared/pagination/SortItem";
import { SortOrder } from "@/models/shared/pagination/SortOrder";
import { asc, desc } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export const convertColumnsMapSortByToSql = <TColumnsMap extends Record<string, PgColumn>>(
  columnsMap: TColumnsMap,
  sortBy: SortItem<keyof TColumnsMap & string>[],
) => sortBy.map((sb) => (sb.order === SortOrder.Asc ? asc(columnsMap[sb.key]) : desc(columnsMap[sb.key])));
