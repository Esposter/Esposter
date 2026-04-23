import { z } from "zod";

export interface DataSourceStatistics {
  columnCount: number;
  rowCount: number;
  size: number;
}

export const dataSourceStatisticsSchema = z.object({
  columnCount: z.int().nonnegative(),
  rowCount: z.int(),
  size: z.int(),
}) satisfies z.ZodType<DataSourceStatistics>;
