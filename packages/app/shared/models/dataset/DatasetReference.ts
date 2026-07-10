import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { ItemEntityType } from "@esposter/shared";

import { datasetProviderTypeSchema } from "#shared/models/dataset/DatasetProviderType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatasetReference extends ItemEntityType<DatasetProviderType> {
  id: string;
}

export const datasetReferenceSchema = z.object({
  ...createItemEntityTypeSchema(datasetProviderTypeSchema).shape,
  id: z.uuid(),
}) satisfies z.ZodType<DatasetReference>;
