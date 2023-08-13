import { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

export type CompositeKey = OmitIndexSignature<TableEntity>;

export class CompositeKeyEntity implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export class AzureEntity extends CompositeKeyEntity implements ItemMetadata {
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt: Date | null = null;
}

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
