import type { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";

import { datasetAggregationTypeSchema } from "#shared/models/dataset/DatasetAggregationType";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

export interface DatasetQuerySeries {
  aggregation: DatasetAggregationType;
  column: string;
}

export const datasetQuerySeriesSchema = z.object({
  aggregation: datasetAggregationTypeSchema,
  column: z.string().min(1).max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<DatasetQuerySeries>;
