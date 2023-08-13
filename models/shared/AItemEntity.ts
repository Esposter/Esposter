import { ItemMetadata, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export abstract class AItemEntity implements ItemMetadata {
  id = uuidv4();
  name = DEFAULT_NAME;
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt: Date | null = null;
}

export const aItemEntitySchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  }),
) satisfies z.ZodType<AItemEntity>;
