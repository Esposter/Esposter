import { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import { applyItemMetadataMixin } from "@esposter/shared";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;
