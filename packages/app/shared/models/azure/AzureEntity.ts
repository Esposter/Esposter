import { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import { applyItemMetadataMixin } from "#shared/models/entity/ItemMetadata";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;
