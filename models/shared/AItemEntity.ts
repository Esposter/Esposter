import { ApplyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export type AItemEntity = typeof AItemEntity.prototype;
export const AItemEntity = ApplyItemMetadataMixin(
  class ItemEntity {
    id = uuidv4();
    name = DEFAULT_NAME;
  },
);

export const aItemEntitySchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  }),
) satisfies z.ZodType<AItemEntity>;
