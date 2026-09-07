import type { DatasetQuerySeries } from "#shared/models/dataset/DatasetQuerySeries";

import { datasetQuerySeriesSchema } from "#shared/models/dataset/DatasetQuerySeries";
import { z } from "zod";

export interface DatasetQuery {
  series: DatasetQuerySeries[];
  xColumn: string;
}

export const datasetQuerySchema = z.object({
  series: z.array(datasetQuerySeriesSchema).min(1),
  xColumn: z.string().min(1),
}) satisfies z.ZodType<DatasetQuery>;
