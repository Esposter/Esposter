import { z } from "zod";

export interface DataSourceStatistics {
  columnCount: number;
  rowCount: number;
  size: number;
}

export const dataSourceStatisticsSchema = z.object({
  columnCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
}) satisfies z.ZodType<DataSourceStatistics>;
