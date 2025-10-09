import type { CompositeKeyEntityConstraint } from "@/models/azure/table/CompositeKeyEntity";

import { CompositeKeyEntity, createCompositeKeyEntitySchema } from "@/models/azure/table/CompositeKeyEntity";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { applyItemMetadataMixin } from "@/services/shared/applyItemMetadataMixin";
import { z } from "zod";

export const AzureEntity: ReturnType<typeof applyItemMetadataMixin<typeof CompositeKeyEntity>> =
  applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(
  schema: z.ZodObject<TEntity>,
): z.ZodObject<TEntity & typeof itemMetadataSchema.shape> =>
  z.object({
    ...createCompositeKeyEntitySchema(schema).shape,
    ...itemMetadataSchema.shape,
  });
