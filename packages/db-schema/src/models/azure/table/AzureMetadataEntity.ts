import type { CompositeKeyEntityConstraint } from "@/models/azure/table/CompositeKeyEntity";
import type { ItemEntityType } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
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
