import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

import { columnTypeSchema } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

export interface ColumnStatistics {
  average?: number;
  columnName: string;
  columnType: ColumnType;
  falseCount?: number;
  maximum?: number;
  minimum?: number;
  mostFrequentValue?: string;
  nullCount: number;
  nullPercentage?: number;
  standardDeviation?: number;
  summation?: number;
  topFrequencies?: readonly (readonly [string, number])[];
  trueCount?: number;
  uniqueCount?: number;
}

export const columnStatisticsSchema = z.object({
  average: z.number().optional(),
  columnName: z.string(),
  columnType: columnTypeSchema,
  falseCount: z.int().nonnegative().optional(),
  maximum: z.number().optional(),
  minimum: z.number().optional(),
  mostFrequentValue: z.string().optional(),
  nullCount: z.int().nonnegative(),
  nullPercentage: z.number().min(0).max(100).optional(),
  standardDeviation: z.number().nonnegative().optional(),
  summation: z.number().optional(),
  topFrequencies: z
    .array(z.tuple([z.string(), z.int().positive()]).readonly())
    .readonly()
    .optional(),
  trueCount: z.int().nonnegative().optional(),
  uniqueCount: z.int().nonnegative().optional(),
}) satisfies z.ZodType<ColumnStatistics>;
