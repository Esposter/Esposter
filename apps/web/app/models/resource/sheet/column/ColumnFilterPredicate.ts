import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

export type ColumnFilterPredicate<T extends ColumnFilter> = (filter: T, cellValue: ColumnValue) => boolean;
