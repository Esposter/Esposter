import type { CompositeKeyEntityConstraint } from "#shared/models/azure/CompositeKeyEntity";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { z } from "zod";

import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";

export abstract class AzureMetadataEntity<TType extends string> extends AzureEntity implements ItemEntityType<TType> {
  type!: TType;
}

export const createAzureMetadataEntitySchema = <TEntity extends CompositeKeyEntityConstraint, TType extends string>(
  schema: z.ZodObject<TEntity>,
  typeSchema: z.ZodType<TType>,
) => createAzureEntitySchema(schema).merge(createItemEntityTypeSchema(typeSchema));
