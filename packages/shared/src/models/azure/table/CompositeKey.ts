import type { PropertyNames } from "@/util/types/PropertyNames";
import type { TableEntity } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";

import { getPropertyNames } from "@/util/getPropertyNames";

export class CompositeKey implements OmitIndexSignature<TableEntity> {
  partitionKey!: string;
  rowKey!: string;
}

export const CompositeKeyPropertyNames: PropertyNames<CompositeKey> = getPropertyNames<CompositeKey>();
