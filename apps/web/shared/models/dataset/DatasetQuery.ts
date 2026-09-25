import type { DatasetQuerySeries } from "#shared/models/dataset/DatasetQuerySeries";

import { datasetQuerySeriesSchema } from "#shared/models/dataset/DatasetQuerySeries";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export interface DatasetQuery {
  series: DatasetQuerySeries[];
  xColumn: string;
}

export const datasetQuerySchema = z.object({
  series: z.array(datasetQuerySeriesSchema).min(1).max(MAX_RESOURCE_CONTENT_LENGTH),
  xColumn: z.string().min(1).max(MAX_RESOURCE_CONTENT_LENGTH),
}) satisfies z.ZodType<DatasetQuery>;
