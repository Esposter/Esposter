import type { CompositeKeyEntityConstraint } from "#src/models/azure/table/CompositeKeyEntity";

import { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import { itemMetadataSchema } from "#src/models/azure/table/ItemMetadata";
import { applyItemMetadataMixin } from "@esposter/shared";
import { z } from "zod";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  z.object({ ...schema.shape, ...itemMetadataSchema.shape });
