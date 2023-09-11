import { ApplyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { z } from "zod";

export type AItemEntity = typeof AItemEntity.prototype;
export const AItemEntity = ApplyItemMetadataMixin(
  class ItemEntity {
    id = crypto.randomUUID() as string;
    name = DEFAULT_NAME;
  },
);

export const aItemEntitySchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  }),
) satisfies z.ZodType<AItemEntity>;
