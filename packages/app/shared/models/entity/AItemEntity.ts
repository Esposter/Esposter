import type { Except } from "type-fest";

import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

export type AItemEntity = typeof AItemEntity.prototype;

class BaseAItemEntity extends Serializable {
  id: string = crypto.randomUUID();
}
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);

export const aItemEntitySchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<AItemEntity, "toJSON">>;
