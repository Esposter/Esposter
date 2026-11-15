import { CompositeKeyEntity } from "#src/models/shared/CompositeKeyEntity";
import { applyItemMetadataMixin } from "@esposter/shared";

export const ItemCompositeKeyEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type ItemCompositeKeyEntity = typeof ItemCompositeKeyEntity.prototype;
