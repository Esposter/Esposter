import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

import { columnTypeSchema } from "#shared/models/tableEditor/file/column/ColumnType";
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
  falseCount: z.number().nullable(),
  maximum: z.number().nullable(),
  minimum: z.number().nullable(),
  mostFrequentValue: z.string().nullable(),
  nullCount: z.number(),
  nullPercent: z.number().nullable(),
  standardDeviation: z.number().nullable(),
  summation: z.number().nullable(),
  topFrequencies: z
    .array(z.tuple([z.string(), z.number()]).readonly())
    .readonly()
    .nullable(),
  trueCount: z.number().nullable(),
  uniqueCount: z.number().nullable(),
});
