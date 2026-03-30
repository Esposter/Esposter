import { z } from "zod";

export interface DataSourceStats {
  columnCount: number;
  rowCount: number;
  size: number;
}

export const dataSourceStatsSchema = z.object({
  columnCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
}) satisfies z.ZodType<DataSourceStats>;
