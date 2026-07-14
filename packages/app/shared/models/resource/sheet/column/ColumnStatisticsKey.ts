import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { columnStatisticsSchema } from "#shared/models/resource/sheet/column/ColumnStatistics";
import { z } from "zod";

export type ColumnStatisticsKey = Exclude<keyof ColumnStatistics, "columnName" | "columnType" | "topFrequencies">;

export const columnStatisticsKeySchema = columnStatisticsSchema
  .keyof()
  .exclude(["columnName", "columnType", "topFrequencies"]) satisfies z.ZodType<ColumnStatisticsKey>;
