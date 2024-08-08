import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

import { applyItemMetadataMixin } from "@/models/shared/ItemMetadata";

export type CompositeKey = OmitIndexSignature<TableEntity>;

export class CompositeKeyEntity implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export type AzureEntity = typeof AzureEntity.prototype;
export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
