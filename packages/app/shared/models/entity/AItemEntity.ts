import type { ToData } from "#shared/models/entity/ToData";

import { itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { applyItemMetadataMixin } from "#shared/services/entity/applyItemMetadataMixin";
import { z } from "zod";

class BaseAItemEntity extends Serializable {
  id: string = crypto.randomUUID();
}
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);
export type AItemEntity = typeof AItemEntity.prototype;

export const aItemEntitySchema = z.object({
  ...itemMetadataSchema.shape,
  id: z.uuid(),
}) satisfies z.ZodType<ToData<AItemEntity>>;
