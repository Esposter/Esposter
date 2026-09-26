import type { DatasetQuerySeries } from "#shared/models/dataset/DatasetQuerySeries";

import { datasetQuerySeriesSchema } from "#shared/models/dataset/DatasetQuerySeries";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

export interface DatasetQuery {
  series: DatasetQuerySeries[];
  xColumn: string;
}

export const datasetQuerySchema = z.object({
  series: z.array(datasetQuerySeriesSchema).min(1).max(MAX_RESOURCE_CONTENT_SIZE),
  xColumn: z.string().min(1).max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<DatasetQuery>;
