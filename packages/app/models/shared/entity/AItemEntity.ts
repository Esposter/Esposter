import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/itemMetadata";
import { z } from "zod";

class BaseAItemEntity {
  id: string = crypto.randomUUID();
}

export type AItemEntity = typeof AItemEntity.prototype;
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);

export const aItemEntitySchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<AItemEntity>;
