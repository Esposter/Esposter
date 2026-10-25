import type { CompositeKeyEntityConstraint } from "#src/models/azure/table/CompositeKeyEntityConstraint";

import { itemMetadataSchema } from "#src/models/azure/table/ItemMetadata";
import { z } from "zod";

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  z.object({ ...schema.shape, ...itemMetadataSchema.shape });
