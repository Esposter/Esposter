import { ApplyItemMetadataMixin } from "@/models/shared/ItemMetadata";
import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

export type CompositeKey = OmitIndexSignature<TableEntity>;

export class CompositeKeyEntity implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export type AzureEntity = typeof AzureEntity.prototype;
export const AzureEntity = ApplyItemMetadataMixin(CompositeKeyEntity);

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
