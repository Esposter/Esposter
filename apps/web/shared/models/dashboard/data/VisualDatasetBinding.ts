import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { datasetSchema } from "#shared/models/dataset/Dataset";
import { datasetQuerySchema } from "#shared/models/dataset/DatasetQuery";
import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { z } from "zod";

export interface VisualDatasetBinding {
  query: DatasetQuery;
  reference: DatasetReference;
  // Baked-in resolved dataset for published dashboards, so public viewers never resolve references
  snapshot?: Dataset;
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- DatasetAggregationType and DatasetProviderType are the same declarations on both sides (DatasetQuerySeries.ts:1, DatasetReference.ts:1); the rule flags a nested zod shape even on an exact enum match
export const visualDatasetBindingSchema = z.object({
  query: datasetQuerySchema,
  reference: datasetReferenceSchema,
  snapshot: datasetSchema.optional(),
}) satisfies z.ZodType<VisualDatasetBinding>;
