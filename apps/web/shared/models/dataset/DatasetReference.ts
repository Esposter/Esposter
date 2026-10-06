import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { ItemEntityType } from "@esposter/shared";

import { datasetProviderTypeSchema } from "#shared/models/dataset/DatasetProviderType";
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { ResourceLinkType } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatasetReference extends ItemEntityType<DatasetProviderType> {
  id: string;
}

export const datasetReferenceSchema = z.object({
  ...createItemEntityTypeSchema(datasetProviderTypeSchema).shape,
  id: createResourceLinkSchema(ResourceLinkType.Dataset),
}) satisfies z.ZodType<DatasetReference>;
