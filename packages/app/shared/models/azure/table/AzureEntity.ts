import type { CompositeKeyEntityConstraint } from "#shared/models/azure/table/CompositeKeyEntity";

import { CompositeKeyEntity, createCompositeKeyEntitySchema } from "#shared/models/azure/table/CompositeKeyEntity";
import { applyItemMetadataMixin } from "#shared/services/entity/applyItemMetadataMixin";
import { itemMetadataSchema } from "@esposter/shared";
import { z } from "zod";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  z.object({
    ...createCompositeKeyEntitySchema(schema).shape,
    ...itemMetadataSchema.shape,
  });
