import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

export type CompositeKey = OmitIndexSignature<TableEntity>;

export class CompositeKeyEntity implements CompositeKey {
  partitionKey!: string;

  rowKey!: string;
}

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
