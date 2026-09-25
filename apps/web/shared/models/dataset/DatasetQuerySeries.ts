import type { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";

import { datasetAggregationTypeSchema } from "#shared/models/dataset/DatasetAggregationType";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export interface DatasetQuerySeries {
  aggregation: DatasetAggregationType;
  column: string;
}

export const datasetQuerySeriesSchema = z.object({
  aggregation: datasetAggregationTypeSchema,
  column: z.string().min(1).max(MAX_RESOURCE_CONTENT_LENGTH),
}) satisfies z.ZodType<DatasetQuerySeries>;
