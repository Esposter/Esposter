import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

import { columnTypeSchema } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

export interface ColumnStatistics {
  average: null | number;
  columnName: string;
  columnType: ColumnType;
  falseCount: null | number;
  maximum: null | number;
  minimum: null | number;
  mostFrequentValue: null | string;
  nullCount: number;
  nullPercent: null | number;
  standardDeviation: null | number;
  summation: null | number;
  topFrequencies: null | readonly (readonly [string, number])[];
  trueCount: null | number;
  uniqueCount: null | number;
}

export const columnStatisticsSchema = z.object({
  average: z.number().nullable(),
  columnName: z.string(),
  columnType: columnTypeSchema,
  falseCount: z.int().nonnegative().nullable(),
  maximum: z.number().nullable(),
  minimum: z.number().nullable(),
  mostFrequentValue: z.string().nullable(),
  nullCount: z.int().nonnegative(),
  nullPercent: z.number().min(0).max(100).nullable(),
  standardDeviation: z.number().nonnegative().nullable(),
  summation: z.number().nullable(),
  topFrequencies: z
    .array(z.tuple([z.string(), z.int().positive()]).readonly())
    .readonly()
    .nullable(),
  trueCount: z.int().nonnegative().nullable(),
  uniqueCount: z.int().nonnegative().nullable(),
});
