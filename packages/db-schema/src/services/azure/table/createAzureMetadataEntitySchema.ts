import type { CompositeKeyEntityConstraint } from "#src/models/azure/table/CompositeKeyEntityConstraint";

import { createAzureEntitySchema } from "#src/services/azure/table/createAzureEntitySchema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export const createAzureMetadataEntitySchema = <
  TEntity extends CompositeKeyEntityConstraint,
  T extends z.ZodType<string>,
>(
  schema: z.ZodObject<TEntity>,
  typeSchema: T,
) => z.object({ ...createAzureEntitySchema(schema).shape, ...createItemEntityTypeSchema(typeSchema).shape });
