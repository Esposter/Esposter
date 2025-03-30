import type { CompositeKeyEntityConstraint } from "#shared/models/azure/CompositeKeyEntity";
import type { z } from "zod";

import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class AzureMetadataEntity<TType extends string> extends AzureEntity {
  type!: TType;
}

export const createAzureMetadataEntitySchema = <
  TType extends string,
  TEntity extends CompositeKeyEntityConstraint & { type: z.ZodType<TType> },
>(
  schema: z.ZodObject<TEntity>,
) => createAzureEntitySchema(schema);
