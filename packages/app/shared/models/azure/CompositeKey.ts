import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

export class CompositeKey implements OmitIndexSignature<TableEntity> {
  partitionKey!: string;
  rowKey!: string;
}
