import type { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";

import { datasetAggregationTypeSchema } from "#shared/models/dataset/DatasetAggregationType";
import { z } from "zod";

export interface DatasetQuerySeries {
  aggregation: DatasetAggregationType;
  column: string;
}

export const datasetQuerySeriesSchema = z.object({
  aggregation: datasetAggregationTypeSchema,
  column: z.string().min(1),
}) satisfies z.ZodType<DatasetQuerySeries>;
