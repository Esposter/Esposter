import type { CompositeKeyEntityConstraint } from "#src/models/streams/CompositeKeyEntityConstraint";

import { itemMetadataSchema } from "#src/models/streams/ItemMetadata";
import { z } from "zod";

export const createAzureEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(schema: z.ZodObject<TEntity>) =>
  z.object({ ...schema.shape, ...itemMetadataSchema.shape });
