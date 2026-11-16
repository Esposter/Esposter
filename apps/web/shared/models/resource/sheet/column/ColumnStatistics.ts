import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

import { ColumnStatisticName } from "#shared/models/resource/sheet/column/ColumnStatisticName";
import { columnTypeSchema } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

export interface ColumnStatistics {
  [ColumnStatisticName.Average]?: number | undefined;
  [ColumnStatisticName.FalseCount]?: number | undefined;
  [ColumnStatisticName.Maximum]?: number | undefined;
  [ColumnStatisticName.Minimum]?: number | undefined;
  [ColumnStatisticName.MostFrequentValue]?: string | undefined;
  [ColumnStatisticName.NullCount]: number;
  [ColumnStatisticName.NullPercentage]?: number | undefined;
  [ColumnStatisticName.StandardDeviation]?: number | undefined;
  [ColumnStatisticName.Summation]?: number | undefined;
  [ColumnStatisticName.TrueCount]?: number | undefined;
  [ColumnStatisticName.UniqueCount]?: number | undefined;
  columnName: string;
  columnType: ColumnType;
  topFrequencies?: readonly (readonly [string, number])[] | undefined;
}

export const columnStatisticsSchema = z.object({
  columnName: z.string(),
  [ColumnStatisticName.Average]: z.number().optional(),
  [ColumnStatisticName.FalseCount]: z.int().nonnegative().optional(),
  [ColumnStatisticName.Maximum]: z.number().optional(),
  [ColumnStatisticName.Minimum]: z.number().optional(),
  [ColumnStatisticName.MostFrequentValue]: z.string().optional(),
  [ColumnStatisticName.NullCount]: z.int().nonnegative(),
  [ColumnStatisticName.NullPercentage]: z.number().min(0).max(100).optional(),
  [ColumnStatisticName.StandardDeviation]: z.number().nonnegative().optional(),
  [ColumnStatisticName.Summation]: z.number().optional(),
  [ColumnStatisticName.TrueCount]: z.int().nonnegative().optional(),
  [ColumnStatisticName.UniqueCount]: z.int().nonnegative().optional(),
  columnType: columnTypeSchema,
  topFrequencies: z
    .array(z.tuple([z.string(), z.int().positive()]).readonly())
    .readonly()
    .optional(),
}) satisfies z.ZodType<ColumnStatistics>;
