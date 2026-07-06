import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { datasetQuerySchema } from "#shared/models/dataset/DatasetQuery";
import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { z } from "zod";

export interface VisualDatasetBinding {
  query: DatasetQuery;
  reference: DatasetReference;
}

export const visualDatasetBindingSchema = z.object({
  query: datasetQuerySchema,
  reference: datasetReferenceSchema,
}) satisfies z.ZodType<VisualDatasetBinding>;
