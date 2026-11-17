import type { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";

import { datasetOrderDirectionSchema } from "#shared/models/dataset/DatasetOrderDirection";
import { z } from "zod";

export interface DatasetQueryOrder {
  direction: DatasetOrderDirection;
  // The place in the query's series the categories rank by, absent to rank them by the category itself
  seriesIndex?: number | undefined;
}

export const datasetQueryOrderSchema = z.object({
  direction: datasetOrderDirectionSchema,
  seriesIndex: z.int().nonnegative().optional(),
}) satisfies z.ZodType<DatasetQueryOrder>;
