import type { ToData } from "#shared/models/entity/ToData";

import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

class BaseAItemEntity extends Serializable {
  id: string = crypto.randomUUID();
}
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);
export type AItemEntity = typeof AItemEntity.prototype;

export const aItemEntitySchema = z
  .object({
    id: z.uuid(),
  })
  .extend(itemMetadataSchema) satisfies z.ZodType<ToData<AItemEntity>>;
