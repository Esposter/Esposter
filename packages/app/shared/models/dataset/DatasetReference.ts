import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { ItemEntityType } from "@esposter/shared";

import { datasetProviderTypeSchema } from "#shared/models/dataset/DatasetProviderType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatasetReference extends ItemEntityType<DatasetProviderType> {
  id: string;
  // Sub-resource within the referenced document, e.g. a table document's data source item
  itemId?: string;
}

export const datasetReferenceSchema = z.object({
  ...createItemEntityTypeSchema(datasetProviderTypeSchema).shape,
  id: z.uuid(),
  itemId: z.uuid().optional(),
}) satisfies z.ZodType<DatasetReference>;
