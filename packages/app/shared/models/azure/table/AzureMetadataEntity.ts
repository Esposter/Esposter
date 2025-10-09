import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { CompositeKeyEntityConstraint } from "@esposter/shared";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { AzureEntity, createAzureEntitySchema } from "@esposter/shared";
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
