import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { type } from "arktype";

class BaseAItemEntity extends Serializable {
  id: string = crypto.randomUUID();
}
export const AItemEntity = applyItemMetadataMixin(BaseAItemEntity);
export type AItemEntity = typeof AItemEntity.prototype;

export const aItemEntitySchema = type({
  id: "string.uuid.v4",
}).merge(itemMetadataSchema) satisfies Type<ToData<AItemEntity>>;
