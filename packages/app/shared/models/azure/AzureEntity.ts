import type { CompositeKeyEntityConstraint } from "#shared/models/azure/CompositeKeyEntity";

import { CompositeKeyEntity, createCompositeKeyEntitySchema } from "#shared/models/azure/CompositeKeyEntity";
import { itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { applyItemMetadataMixin } from "#shared/services/entity/applyItemMetadataMixin";
import { z } from "zod/v4";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  z.object({
    ...createCompositeKeyEntitySchema(schema).shape,
    ...itemMetadataSchema.shape,
  });
