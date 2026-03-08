import { z } from "zod";

export interface DataSourceStats {
  columnCount: number;
  rowCount: number;
  size: number;
}

export const dataSourceStatsSchema = z.object({
  columnCount: z.number(),
  rowCount: z.number(),
  size: z.number(),
}) satisfies z.ZodType<DataSourceStats>;
