import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

export type ColumnStatisticKey = Exclude<keyof ColumnStatistics, "columnName" | "columnType">;
