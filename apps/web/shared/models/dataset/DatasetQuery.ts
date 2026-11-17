import type { DatasetQueryOrder } from "#shared/models/dataset/DatasetQueryOrder";
import type { DatasetQuerySeries } from "#shared/models/dataset/DatasetQuerySeries";

import { datasetQueryOrderSchema } from "#shared/models/dataset/DatasetQueryOrder";
import { datasetQuerySeriesSchema } from "#shared/models/dataset/DatasetQuerySeries";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

export interface DatasetQuery {
  // Absent, the categories keep the order their rows first name them
  order?: DatasetQueryOrder | undefined;
  series: DatasetQuerySeries[];
  xColumn: string;
}

export const datasetQuerySchema = z
  .object({
    order: datasetQueryOrderSchema.optional(),
    series: z.array(datasetQuerySeriesSchema).min(1).max(MAX_RESOURCE_CONTENT_SIZE),
    xColumn: z.string().min(1).max(MAX_RESOURCE_CONTENT_SIZE),
  })
  .superRefine((query, context) => {
    const seriesIndex = query.order?.seriesIndex;
    if (seriesIndex !== undefined && seriesIndex >= query.series.length)
      context.addIssue({
        code: "custom",
        message: "An order names a series the query does not have",
        path: ["order", "seriesIndex"],
      });
  }) satisfies z.ZodType<DatasetQuery>;
