import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

import { getPropertyNames } from "@esposter/shared";

export class CompositeKey implements OmitIndexSignature<TableEntity> {
  partitionKey!: string;
  rowKey!: string;
}

export const CompositeKeyPropertyNames = getPropertyNames<CompositeKey>();
