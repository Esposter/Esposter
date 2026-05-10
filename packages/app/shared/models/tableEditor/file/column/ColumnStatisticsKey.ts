import type { ColumnStatistics } from "#shared/models/tableEditor/file/column/ColumnStatistics";

import { columnStatisticsSchema } from "#shared/models/tableEditor/file/column/ColumnStatistics";
import { z } from "zod";

export type ColumnStatisticsKey = Exclude<keyof ColumnStatistics, "columnName" | "columnType" | "topFrequencies">;

export const columnStatisticsKeySchema = columnStatisticsSchema
  .keyof()
  .exclude(["columnName", "columnType", "topFrequencies"]) satisfies z.ZodType<ColumnStatisticsKey>;
