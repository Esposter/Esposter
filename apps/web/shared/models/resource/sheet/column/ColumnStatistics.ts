import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

import { columnTypeSchema } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnStatisticName } from "#shared/models/resource/sheet/column/ColumnStatisticName";
import { z } from "zod";

export interface ColumnStatistics {
  [ColumnStatisticName.Average]?: number;
  columnName: string;
  columnType: ColumnType;
  [ColumnStatisticName.FalseCount]?: number;
  [ColumnStatisticName.Maximum]?: number;
  [ColumnStatisticName.Minimum]?: number;
  [ColumnStatisticName.MostFrequentValue]?: string;
  [ColumnStatisticName.NullCount]: number;
  [ColumnStatisticName.NullPercentage]?: number;
  [ColumnStatisticName.StandardDeviation]?: number;
  [ColumnStatisticName.Summation]?: number;
  topFrequencies?: readonly (readonly [string, number])[];
  [ColumnStatisticName.TrueCount]?: number;
  [ColumnStatisticName.UniqueCount]?: number;
}

export const columnStatisticsSchema = z.object({
  [ColumnStatisticName.Average]: z.number().optional(),
  columnName: z.string(),
  columnType: columnTypeSchema,
  [ColumnStatisticName.FalseCount]: z.int().nonnegative().optional(),
  [ColumnStatisticName.Maximum]: z.number().optional(),
  [ColumnStatisticName.Minimum]: z.number().optional(),
  [ColumnStatisticName.MostFrequentValue]: z.string().optional(),
  [ColumnStatisticName.NullCount]: z.int().nonnegative(),
  [ColumnStatisticName.NullPercentage]: z.number().min(0).max(100).optional(),
  [ColumnStatisticName.StandardDeviation]: z.number().nonnegative().optional(),
  [ColumnStatisticName.Summation]: z.number().optional(),
  topFrequencies: z
    .array(z.tuple([z.string(), z.int().positive()]).readonly())
    .readonly()
    .optional(),
  [ColumnStatisticName.TrueCount]: z.int().nonnegative().optional(),
  [ColumnStatisticName.UniqueCount]: z.int().nonnegative().optional(),
}) satisfies z.ZodType<ColumnStatistics>;
