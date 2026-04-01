import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

export type ColumnStatisticsKey = Exclude<keyof ColumnStatistics, "columnName" | "columnType" | "topFrequencies">;
