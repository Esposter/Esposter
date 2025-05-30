import type { CompositeKeyEntityConstraint } from "#shared/models/azure/CompositeKeyEntity";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod/v4";

export abstract class AzureMetadataEntity<TType extends string> extends AzureEntity implements ItemEntityType<TType> {
  type!: TType;
}

export const createAzureMetadataEntitySchema = <TEntity extends CompositeKeyEntityConstraint, TType extends string>(
  schema: z.ZodObject<TEntity>,
  typeSchema: z.ZodType<TType>,
) =>
  z.object({
    ...createAzureEntitySchema(schema).shape,
    ...createItemEntityTypeSchema(typeSchema).shape,
  });
