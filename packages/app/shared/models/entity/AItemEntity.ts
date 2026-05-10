import type { ToData } from "@esposter/shared";

import { applyItemMetadataMixin, getPropertyNames, itemMetadataSchema, Serializable } from "@esposter/shared";
import { z } from "zod";

class BaseAItemEntity extends Serializable {
  id: string = crypto.randomUUID();
}
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);
export type AItemEntity = typeof AItemEntity.prototype;

export const AItemEntityPropertyNames = getPropertyNames<AItemEntity>();

export const aItemEntitySchema = z.object({
  ...itemMetadataSchema.shape,
  id: z.uuid(),
}) satisfies z.ZodType<ToData<AItemEntity>>;
