import { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";
import { applyItemMetadataMixin } from "@/shared/models/itemMetadata";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;
