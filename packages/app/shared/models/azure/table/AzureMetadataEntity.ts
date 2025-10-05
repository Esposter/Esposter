import type { CompositeKeyEntityConstraint } from "#shared/models/azure/table/CompositeKeyEntity";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/table/AzureEntity";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod";

export abstract class AzureMetadataEntity<T extends string> extends AzureEntity implements ItemEntityType<T> {
  type!: T;
}

export const createAzureMetadataEntitySchema = <
  TEntity extends CompositeKeyEntityConstraint,
  T extends z.ZodType<string>,
>(
  schema: z.ZodObject<TEntity>,
  typeSchema: T,
) =>
  z.object({
    ...createAzureEntitySchema(schema).shape,
    ...createItemEntityTypeSchema(typeSchema).shape,
  });
