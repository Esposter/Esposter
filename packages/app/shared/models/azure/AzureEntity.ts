import type { CompositeKeyEntityConstraint } from "#shared/models/azure/CompositeKeyEntity";
import type { z } from "zod";

import { CompositeKeyEntity, createCompositeKeyEntitySchema } from "#shared/models/azure/CompositeKeyEntity";
import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  createCompositeKeyEntitySchema(schema).merge(itemMetadataSchema);
