import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { z } from "zod";

export type AItemEntity = typeof AItemEntity.prototype;
export const AItemEntity = applyItemMetadataMixin(
  class ItemEntity {
    id = crypto.randomUUID() as string;
    name = DEFAULT_NAME;
  },
);

export const aItemEntitySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<AItemEntity>;
