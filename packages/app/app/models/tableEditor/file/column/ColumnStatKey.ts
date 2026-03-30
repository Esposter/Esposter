import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

export type ColumnStatKey = Exclude<keyof ColumnStats, "columnName" | "columnType">;
