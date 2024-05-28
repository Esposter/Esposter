import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export type AItemEntity = typeof AItemEntity.prototype;
export const AItemEntity = applyItemMetadataMixin(
  class ItemEntity {
    id: string = crypto.randomUUID();
  },
);

export const aItemEntitySchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<AItemEntity>;
